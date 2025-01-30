import type { Node } from "unist"

interface ConvertOptions {
  removeHeaderMarkers: boolean
  ignoreYamlFrontmatter?: boolean
}

export function convertToOutline(node: Node, depth = 0, options: ConvertOptions = { removeHeaderMarkers: false, ignoreYamlFrontmatter: true }): string {
  if (!node || typeof node !== "object") {
    throw new Error(`Invalid node: ${JSON.stringify(node)}`)
  }

  // 计算缩进
  const getIndent = (d: number) => "  ".repeat(Math.max(0, d))

  // 处理文本内容
  const processTextContent = (node: any): string => {
    if (node.type === "text") return node.value
    if (node.type === "link") return `[${node.children[0].value}](${node.url})`
    if (node.type === "emphasis") return `*${node.children.map(processTextContent).join("")}*`
    if (node.type === "strong") return `**${node.children.map(processTextContent).join("")}**`
    if (node.type === "inlineCode") return `\`${node.value}\``
    if (node.type === "code") return `\`\`\`${node.lang || ''}\n${node.value}\n\`\`\``
    return ""
  }

  switch (node.type) {
    case "yaml":
      if (options.ignoreYamlFrontmatter) {
        return ""
      }
      return `${getIndent(depth)}- ${(node as any).value}`

    case "root":
      if (!("children" in node)) {
        throw new Error(`Invalid root node: ${JSON.stringify(node)}`)
      }
      
      let lastHeadingLevel = 0
      
      return (node.children as Node[])
        .map((child) => {
          if (child.type === "heading") {
            const headingLevel = (child as any).depth
            lastHeadingLevel = headingLevel
            // 标题的缩进基于其级别
            return convertToOutline(child, depth + headingLevel - 1, options)
          }
          
          // 非标题内容的缩进基于最近的标题级别
          const contentDepth = lastHeadingLevel ? depth + lastHeadingLevel : depth
          return convertToOutline(child, contentDepth, options)
        })
        .filter(Boolean)
        .join("\n")

    case "heading":
      if (!("depth" in node) || !("children" in node)) {
        throw new Error(`Invalid heading node: ${JSON.stringify(node)}`)
      }
      const headerMarker = options.removeHeaderMarkers ? "" : "#".repeat(node.depth as number) + " "
      const headingContent = (node.children as any[])
        .map(processTextContent)
        .filter(Boolean)
        .join("")
      return `${getIndent(depth)}- ${headerMarker}${headingContent}`

    case "paragraph":
      if (!("children" in node)) {
        throw new Error(`Invalid paragraph node: ${JSON.stringify(node)}`)
      }
      const paragraphContent = (node.children as any[])
        .map(processTextContent)
        .filter(Boolean)
        .join("")
      const trimmedContent = paragraphContent.trim()
      if (!trimmedContent) return ""
      if (trimmedContent.startsWith('-')) {
        // 如果内容以 '-' 开头，增加一级缩进
        return `${getIndent(depth + 1)}${trimmedContent}`
      }
      return `${getIndent(depth)}- ${trimmedContent}`

    case "list":
      if (!("children" in node)) {
        throw new Error(`Invalid list node: ${JSON.stringify(node)}`)
      }
      return (node.children as Node[])
        .map((item) => convertToOutline(item, depth, options))
        .filter(Boolean)
        .join("\n")

    case "listItem":
      if (!("children" in node)) {
        throw new Error(`Invalid listItem node: ${JSON.stringify(node)}`)
      }
      const itemContent = (node.children as Node[])
        .map((child) => convertToOutline(child, depth + 1, options))
        .filter(Boolean)
        .join("\n")
      const trimmedItemContent = itemContent.trim()
      if (!trimmedItemContent) return ""
      if (trimmedItemContent.startsWith('-')) {
        // 如果内容以 '-' 开头，增加一级缩进
        return `${getIndent(depth + 1)}${trimmedItemContent}`
      }
      return `${getIndent(depth)}- ${trimmedItemContent}`

    case "code":
      if (!("value" in node)) {
        throw new Error(`Invalid code node: ${JSON.stringify(node)}`)
      }
      // 将代码内容按行分割，每行都添加缩进
      const lines = (node as any).value.split('\n')
      const indentedLines = lines.map(line => `${getIndent(depth + 2)}${line}`)  // 代码内容再多缩进一级
      const codeContent = `\`\`\`${(node as any).lang || ''}\n${indentedLines.join('\n')}\n${getIndent(depth + 1)}\`\`\``  // 代码块标记缩进一级
      return `${getIndent(depth + 1)}- ${codeContent}`  // 整个代码块缩进一级

    default:
      return ""
  }
}
