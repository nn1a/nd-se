import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def add_mdx_content():
    """Add MDX demo content to the database"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "nd_se")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    docs_collection = db.docs
    
    try:
        # Add MDX demo document
        await docs_collection.insert_one({
            "slug": "mdx-demo",
            "title": "MDX Demo",
            "content": """# MDX Demo

This document demonstrates the power of MDX - Markdown with JSX components!

import { Alert, Card, Badge, Tabs, Tab, CodeBlock } from '../../../components/MDXComponents'

## Interactive Components

### Alerts

<Alert type="info" title="Information">
This is an info alert created with JSX components in MDX!
</Alert>

<Alert type="warning" title="Warning">
Be careful when using MDX - it's very powerful!
</Alert>

<Alert type="error" title="Error">
Something went wrong! This is how you show error messages.
</Alert>

<Alert type="success" title="Success">
Great! You've successfully implemented MDX support.
</Alert>

## Cards

<Card title="Feature Highlights">

### What makes our system special:

- **Interactive Components**: Mix markdown with React components
- **Type Safety**: Full TypeScript support throughout
- **Performance**: Optimized rendering and caching
- **Flexibility**: Easy to extend with custom components

</Card>

<Card title="Getting Started" className="border-blue-200">

Want to try MDX in your content? Just:

1. Add JSX syntax to your markdown
2. Import the components you need
3. Use them inline like HTML tags!

</Card>

## Badges and Status

Here are some status badges: <Badge variant="success">Stable</Badge> <Badge variant="info">New</Badge> <Badge variant="warning">Beta</Badge>

## Tabbed Content

<Tabs defaultTab={0}>
  <Tab label="JavaScript">
    ```javascript
    const greeting = (name) => {
      return `Hello, ${name}!`
    }
    
    console.log(greeting('World'))
    ```
  </Tab>
  <Tab label="Python">
    ```python
    def greeting(name):
        return f"Hello, {name}!"
    
    print(greeting("World"))
    ```
  </Tab>
  <Tab label="TypeScript">
    ```typescript
    const greeting = (name: string): string => {
      return `Hello, ${name}!`
    }
    
    console.log(greeting('World'))
    ```
  </Tab>
</Tabs>

## Custom Code Blocks

<CodeBlock title="Advanced Example" language="tsx">
{`import React, { useState } from 'react'
import { Card, Alert } from './components/MDXComponents'

export const InteractiveDemo = () => {
  const [count, setCount] = useState(0)
  
  return (
    <Card title="Interactive Demo">
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      
      {count > 5 && (
        <Alert type="warning" title="High Count">
          You've clicked the button {count} times!
        </Alert>
      )}
    </Card>
  )
}`}
</CodeBlock>

## Traditional Markdown Still Works

Of course, all the traditional markdown features still work:

### Lists
- Item 1
- Item 2
- Item 3

### Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Markdown | ✅ | Full CommonMark support |
| JSX Components | ✅ | Custom React components |
| Syntax Highlighting | ✅ | Multiple languages |
| Interactive Elements | ✅ | Buttons, forms, etc. |

### Code Blocks

```bash
# Install MDX packages
npm install @mdx-js/react @mdx-js/mdx remark-mdx

# Start development server
npm run dev
```

## Advanced Features

:::tip Pro Tip
You can create your own custom MDX components by adding them to the `components/MDXComponents.tsx` file!
:::

:::note Technical Details
MDX compiles your markdown + JSX into React components at build time for optimal performance.
:::

:::caution Important
Remember that MDX components need to be imported at the top of your document, just like in regular React files.
:::

## Conclusion

MDX provides the perfect balance between the simplicity of Markdown and the power of React components. You can:

- **Write** in familiar Markdown syntax
- **Enhance** with interactive React components  
- **Maintain** type safety with TypeScript
- **Deploy** with optimal performance

<Alert type="success" title="Ready to Go!">
Your documentation system now supports both traditional Markdown and powerful MDX! 🚀
</Alert>
""",
            "order": 6,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        print("✅ Successfully added MDX demo content")
        
    except Exception as e:
        print(f"❌ Error adding MDX content: {e}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(add_mdx_content())
