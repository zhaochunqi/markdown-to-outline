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
        // Parse front matter and get content
        const { content } = matter(markdown)

        // Parse markdown to AST
        const ast = await unified()
          .use(remarkParse)
          .parse(content)

        // Convert AST to outline
        const outlineContent = convertToOutline(ast, 0, { ...options, ignoreYamlFrontmatter: true })
        
        setOutline(outlineContent)
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
