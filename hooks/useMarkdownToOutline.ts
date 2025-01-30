import { useState, useEffect } from "react"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import { visit } from "unist-util-visit"
import matter from "gray-matter"
import { convertToOutline } from "../utils/convertToOutline"

interface UseMarkdownToOutlineOptions {
  removeHeaderMarkers: boolean
}

export function useMarkdownToOutline(markdown: string, options: UseMarkdownToOutlineOptions) {
  const [outline, setOutline] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const process = async () => {
      if (!markdown.trim()) {
        setOutline("")
        setError(null)
        return
      }

      try {
        // Parse front matter
        const { content, data } = matter(markdown)

        const result = await unified()
          .use(remarkParse)
          .use(() => (tree) => {
            const outlineNodes: string[] = []

            // Add front matter to outline if it exists
            if (Object.keys(data).length > 0) {
              outlineNodes.push("- Front Matter:")
              for (const [key, value] of Object.entries(data)) {
                outlineNodes.push(`  - ${key}: ${value}`)
              }
            }

            visit(tree, (node) => {
              if (node.type === "heading" || node.type === "paragraph" || node.type === "list") {
                try {
                  outlineNodes.push(convertToOutline(node, 0, options))
                } catch (err) {
                  console.error("Error converting node:", err)
                  throw new Error(`Error converting node: ${err instanceof Error ? err.message : String(err)}`)
                }
              }
            })
            return outlineNodes.join("\n")
          })
          .use(remarkStringify)
          .process(content) // Process the content without front matter

        setOutline(String(result).trim())
        setError(null)
      } catch (error) {
        console.error("Error processing markdown:", error)
        setError(`Error processing markdown: ${error instanceof Error ? error.message : String(error)}`)
        setOutline("")
      }
    }

    process()
  }, [markdown, options])

  return { outline, error }
}

