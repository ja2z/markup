import { useMemo } from "react";
import MarkupRenderer from "./components/MarkupRenderer";
import "./App.css";
import { client, useConfig, useElementData, useElementColumns } from "@sigmacomputing/plugin";

// Global configuration flag to enable/disable HTML sanitization
// Set to false to allow potentially unsafe HTML rendering
const ENABLE_HTML_SANITIZATION = true;

// Interface for column metadata
interface ColumnInfo {
  name: string;
  columnType: string;
}

// Configure the editor panel
client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "htmlColumn", type: "column", source: "source", allowMultiple: false },
  { 
    name: "markupType", 
    type: "dropdown", 
    values: ["HTML"], 
    defaultValue: "HTML",
    label: "Markup Type"
  },
  {
    name: "allowUnsafeHTML",
    type: "checkbox",
    defaultValue: false,
    label: "Allow Unsafe HTML (Advanced)"
  },
  {
    name: "containerPadding",
    type: "dropdown",
    values: ["0rem", "0.5rem", "1rem", "1.5rem", "2rem"],
    defaultValue: "1rem",
    label: "Container Padding"
  },
  {
    name: "backgroundColor",
    type: "text",
    defaultValue: "#ffffff",
    label: "Background Color"
  }
]);

function App() {
  const config = useConfig();
  const sourceData = useElementData(config.source);
  const columnInfo = useElementColumns(config.source) as Record<string, ColumnInfo>;
  
  // Get configuration values
  const markupType = (client.config.getKey as any)("markupType") as string;
  const allowUnsafeHTML = (client.config.getKey as any)("allowUnsafeHTML") as boolean;
  const containerPadding = (client.config.getKey as any)("containerPadding") as string;
  const backgroundColor = (client.config.getKey as any)("backgroundColor") as string;
  
  // Determine if sanitization should be enabled
  const shouldSanitize = ENABLE_HTML_SANITIZATION && !allowUnsafeHTML;

  // Transform the HTML column data
  const htmlData = useMemo(() => {
    // Safety checks
    if (!sourceData || !config.htmlColumn || !sourceData[config.htmlColumn]) {
      return [];
    }

    const htmlArray = sourceData[config.htmlColumn];
    
    // Filter out null/undefined values and convert to strings
    return htmlArray
      .map((html, index) => ({
        id: index,
        content: html ? String(html) : "",
        isEmpty: !html || String(html).trim() === ""
      }))
      .filter(item => !item.isEmpty);
  }, [sourceData, config.htmlColumn]);

  // Get column name for display
  const columnName = useMemo(() => {
    if (!config.htmlColumn || !columnInfo || !columnInfo[config.htmlColumn]) {
      return "HTML Content";
    }
    return columnInfo[config.htmlColumn].name;
  }, [config.htmlColumn, columnInfo]);

  return (
    <div 
      style={{ 
        backgroundColor: backgroundColor,
        padding: containerPadding,
        minHeight: "100vh",
        width: "100%"
      }}
    >
      <MarkupRenderer
        data={htmlData}
        markupType={markupType}
        shouldSanitize={shouldSanitize}
        columnName={columnName}
      />
    </div>
  );
}

export default App;