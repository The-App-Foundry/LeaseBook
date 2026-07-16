import{j as e}from"./iframe-DnqJuSJ7.js";import{H as r}from"./Header-CwN7KzGR.js";import"./preload-helper-PPVm8Dsz.js";const d={title:"Layout/Header",component:r,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Fixed header component with logo, search bar, and action button. Uses CSS variable --app-header-height (72px)."}}}},t={},a={render:()=>e.jsxs(e.Fragment,{children:[e.jsx(r,{}),e.jsxs("div",{style:{paddingTop:"var(--app-header-height)",padding:"20px"},children:[e.jsx("h1",{children:"Page Content"}),e.jsx("p",{children:"The header is fixed at the top. This content area uses padding-top to offset the header height."})]})]}),parameters:{docs:{description:{story:"Shows how the header integrates with page content using the --app-header-height CSS variable"}}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <>
      <Header />
      <div style={{
      paddingTop: 'var(--app-header-height)',
      padding: '20px'
    }}>
        <h1>Page Content</h1>
        <p>
          The header is fixed at the top. This content area uses padding-top to offset the header
          height.
        </p>
      </div>
    </>,
  parameters: {
    docs: {
      description: {
        story: 'Shows how the header integrates with page content using the --app-header-height CSS variable'
      }
    }
  }
}`,...a.parameters?.docs?.source}}};const h=["Default","WithContent"];export{t as Default,a as WithContent,h as __namedExportsOrder,d as default};
