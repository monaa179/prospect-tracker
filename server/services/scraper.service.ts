import axios from 'axios'
import * as cheerio from 'cheerio'
import pLimit from 'p-limit'
import { extractEmails, extractMobiles } from '../../utils/prospect.utils'

export interface ScrapedData {
    emails: string[]
    mobiles: string[]
}

export class ScraperService {
    private static TIMEOUT = 8000 // 8s per page max
    private static MAX_CONCURRENCY = 5
    private static limit = pLimit(this.MAX_CONCURRENCY)

    /**
     * Scrape a single website for emails and mobile phones
     */
    static async scrapeWebsite(url: string): Promise<ScrapedData> {
        if (!url) return { emails: [], mobiles: [] }
        if (!url.startsWith('http')) url = 'https://' + url

        const allEmails = new Set<string>()
        const allMobiles = new Set<string>()
        const visitedUrls = new Set<string>()

        try {
            console.log(`[Scraper] Starting scrape for ${url}`)

            // 1. Scrape Homepage
            const homepageData = await this.fetchAndExtract(url)
            homepageData.emails.forEach(e => allEmails.add(e))
            homepageData.mobiles.forEach(m => allMobiles.add(m))
            visitedUrls.add(url)

            // 2. Find Contact/Legal links
            const internalLinks = homepageData.links.filter(link => {
                const lowerLink = link.toLowerCase()
                return (lowerLink.includes('contact') || lowerLink.includes('mention') || lowerLink.includes('legal'))
                    && !visitedUrls.has(link)
            }).slice(0, 2) // Limit to 2 additional pages

            // 3. Scrape additional pages in parallel (within the same site limit)
            const additionalResults = await Promise.all(
                internalLinks.map(link => this.fetchAndExtract(link).catch(() => ({ emails: [], mobiles: [], links: [] })))
            )

            additionalResults.forEach(res => {
                res.emails.forEach(e => allEmails.add(e))
                res.mobiles.forEach(m => allMobiles.add(m))
            })

            return {
                emails: [...allEmails],
                mobiles: [...allMobiles]
            }

        } catch (error: any) {
            console.error(`[Scraper] Error scraping ${url}: ${error.message}`)
            return { emails: [], mobiles: [] }
        }
    }

    /**
     * Fetch a URL and extract data
     */
    private static async fetchAndExtract(url: string) {
        try {
            const response = await axios.get(url, {
                timeout: this.TIMEOUT,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            })

            const $ = cheerio.load(response.data)
            const text = $('body').text()

            const emails = new Set(extractEmails(text))
            const mobiles = new Set(extractMobiles(text))

            // Extract emails from mailto links
            $('a[href^="mailto:"]').each((_, el) => {
                const mailto = $(el).attr('href')
                if (mailto) {
                    const email = mailto.replace('mailto:', '').split('?')[0].trim()
                    if (email) emails.add(email.toLowerCase())
                }
            })

            // Extract potential links for contact/legal
            const links: string[] = []
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href')
                if (href && !href.startsWith('mailto:')) {
                    try {
                        const absoluteUrl = new URL(href, url).toString()
                        // Ensure it's the same domain
                        if (new URL(absoluteUrl).hostname === new URL(url).hostname) {
                            links.push(absoluteUrl)
                        }
                    } catch (e) { /* ignore invalid URLs */ }
                }
            })

            return {
                emails: [...emails],
                mobiles: [...mobiles],
                links
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Batch scrape multiple websites with concurrency limit
     */
    static async scrapeBatch(urls: string[]): Promise<Map<string, ScrapedData>> {
        const results = new Map<string, ScrapedData>()

        const tasks = urls.map(url => this.limit(async () => {
            const data = await this.scrapeWebsite(url)
            results.set(url, data)
        }))

        await Promise.all(tasks)
        return results
    }
}
