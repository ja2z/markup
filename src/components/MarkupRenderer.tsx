import React, { useMemo } from "react";

// Simple HTML sanitization function (basic implementation)
// In production, you'd want to use DOMPurify library
const sanitizeHTML = (html: string): string => {
  // Create a temporary div element
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove event handlers (onclick, onload, etc.)
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(element => {
    // Get all attributes
    const attributes = Array.from(element.attributes);
    attributes.forEach(attr => {
      // Remove attributes that start with 'on' (event handlers)
      if (attr.name.toLowerCase().startsWith('on')) {
        element.removeAttribute(attr.name);
      }
      // Remove javascript: links
      if (attr.value && attr.value.toLowerCase().includes('javascript:')) {
        element.removeAttribute(attr.name);
      }
    });
  });
  
  // Remove potentially dangerous tags
  const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button'];
  dangerousTags.forEach(tagName => {
    const elements = temp.querySelectorAll(tagName);
    elements.forEach(element => element.remove());
  });
  
  return temp.innerHTML;
};

interface MarkupItem {
  id: number;
  content: string;
  isEmpty: boolean;
}

interface ProcessedMarkupItem extends MarkupItem {
  processedContent: string;
}

interface MarkupRendererProps {
  data: MarkupItem[];
  markupType: string;
  shouldSanitize: boolean;
  columnName: string;
}

const MarkupRenderer: React.FC<MarkupRendererProps> = ({
  data,
  markupType,
  shouldSanitize,
  columnName
}: MarkupRendererProps) => {
  // Process the HTML content based on sanitization settings
  const processedData = useMemo<ProcessedMarkupItem[]>(() => {
    return data.map((item: MarkupItem) => {
      let processedContent = item.content;
      
      if (markupType === "HTML" && shouldSanitize) {
        try {
          processedContent = sanitizeHTML(item.content);
        } catch (error) {
          console.warn(`Failed to sanitize HTML for item ${item.id}:`, error);
          processedContent = `<p style="color: red;">Error processing HTML content</p>`;
        }
      }
      
      return {
        ...item,
        processedContent
      };
    });
  }, [data, markupType, shouldSanitize]);

  // Log sanitization info for debugging
  React.useEffect(() => {
    if (shouldSanitize) {
      console.log(`Markup Plugin: HTML sanitization is ENABLED for ${data.length} items`);
    } else {
      console.warn(`Markup Plugin: HTML sanitization is DISABLED - potentially unsafe content may be rendered`);
    }
  }, [shouldSanitize, data.length]);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#666',
        fontFamily: 'sans-serif'
      }}>
        <h3>No Markup Content</h3>
        <p>No {markupType} content found in the selected column "{columnName}".</p>
        <p>Make sure your data source contains valid {markupType} markup.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem 0',
        borderBottom: '1px solid #eee'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.25rem',
          color: '#333'
        }}>
          {markupType} Content from "{columnName}"
        </h2>
        <p style={{ 
          margin: '0.25rem 0 0 0', 
          fontSize: '0.875rem',
          color: '#666'
        }}>
          {data.length} item{data.length !== 1 ? 's' : ''} • 
          Sanitization: {shouldSanitize ? 'Enabled' : 'Disabled'}
        </p>
      </div>

      {/* Content Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {processedData.map((item, index) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            {/* Item header */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '0.5rem 1rem',
              borderBottom: '1px solid #ddd',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              Item {index + 1} (Row {item.id + 1})
            </div>
            
            {/* Rendered content */}
            <div 
              style={{ 
                padding: '1rem',
                backgroundColor: 'white',
                minHeight: '2rem'
              }}
              dangerouslySetInnerHTML={{ 
                __html: item.processedContent 
              }}
            />
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <strong>Plugin Info:</strong> Markup Renderer v1.0 • 
        Type: {markupType} • 
        Security: {shouldSanitize ? 'Sanitized' : 'Raw HTML'} • 
        Items: {data.length}
      </div>
    </div>
  );
};

export default MarkupRenderer;