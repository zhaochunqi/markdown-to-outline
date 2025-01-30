"use client"

import { useState, useEffect } from "react"
import { useMarkdownToOutline } from "../hooks/useMarkdownToOutline"

export default function Home() {
  const [markdown, setMarkdown] = useState("")
  const [removeHeaderMarkers, setRemoveHeaderMarkers] = useState(false)
  const { outline, error } = useMarkdownToOutline(markdown, { removeHeaderMarkers })

  useEffect(() => {
    console.log("Current markdown:", markdown)
    console.log("Current outline:", outline)
    if (error) {
      console.error("Error:", error)
    }
  }, [markdown, outline, error])

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-2">Markdown Input</h2>
        <textarea
          className="flex-1 p-2 border rounded-md resize-none"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Enter your Markdown here..."
        />
      </div>
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Outline Output</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={removeHeaderMarkers}
              onChange={(e) => setRemoveHeaderMarkers(e.target.checked)}
              className="mr-2"
            />
            Remove Header Markers
          </label>
        </div>
        <pre className="flex-1 p-2 bg-white border rounded-md overflow-auto whitespace-pre-wrap">
          {error ? `Error: ${error}` : outline || "No outline generated yet"}
        </pre>
      </div>
    </div>
  )
}

