import type { Node } from "unist"

interface ConvertOptions {
  removeHeaderMarkers: boolean
}

export function convertToOutline(node: Node, depth = 0, options: ConvertOptions): string {
  const indent = "  ".repeat(depth)

  if (!node || typeof node !== "object") {
    throw new Error(`Invalid node: ${JSON.stringify(node)}`)
  }

  switch (node.type) {
    case "heading":
      if (!("depth" in node) || !("children" in node)) {
        throw new Error(`Invalid heading node: ${JSON.stringify(node)}`)
      }
      const headerMarker = options.removeHeaderMarkers ? "" : "#".repeat(node.depth as number) + " "
      const headingContent = (node.children as any[])
        .map((child) => {
          if (child.type === "text") return child.value
          if (child.type === "link") return `[${child.children[0].value}](${child.url})`
          return ""
        })
        .join("")
      return `${indent}- ${headerMarker}${headingContent}`

    case "paragraph":
      if (!("children" in node)) {
        throw new Error(`Invalid paragraph node: ${JSON.stringify(node)}`)
      }
      const paragraphContent = (node.children as any[])
        .map((child) => {
          if (child.type === "text") return child.value
          if (child.type === "link") return `[${child.children[0].value}](${child.url})`
          return ""
        })
        .join("")
      return `${indent}- ${paragraphContent}`

    case "list":
      if (!("children" in node)) {
        throw new Error(`Invalid list node: ${JSON.stringify(node)}`)
      }
      return (node.children as Node[]).map((item) => convertToOutline(item, depth, options)).join("\n")

    case "listItem":
      if (!("children" in node)) {
        throw new Error(`Invalid listItem node: ${JSON.stringify(node)}`)
      }
      const itemContent = (node.children as Node[])
        .map((child) => convertToOutline(child, depth + 1, options))
        .join("\n")
      return `${indent}- ${itemContent.trim()}`

    default:
      console.warn(`Unhandled node type: ${node.type}`)
      return ""
  }
}

