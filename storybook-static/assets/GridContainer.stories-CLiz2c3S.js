import{j as r}from"./iframe-DnqJuSJ7.js";import{G as m,P as a}from"./GridContainer-DoAU23s3.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-CZNb5f2f.js";import"./Card-B6qyuBiw.js";import"./Button-DB7Vi8qc.js";import"./Badge-DIXSwEU5.js";import"./SearchBar-DdF3K3jH.js";import"./Sort-CISvqdw4.js";import"./Dropdown-axw9sp4S.js";const n={status:"Active",name:"Harbor View Apartments",businessAddr:"12 Harbor St, Portland, OR",leaseExpiration:"2025-05-01",leaseManager:"John Smith",size:"2,100 sqft",note:"Recently renovated"},x={title:"Layout/GridContainer",component:m,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Responsive grid layout container using CSS Grid with auto-fill and minmax(220px, 1fr). Uses --spacing CSS variable for gap."}}}},t={args:{children:null}},s={args:{children:r.jsxs(r.Fragment,{children:[r.jsx(a,{data:n}),r.jsx(a,{data:{...n,name:"Corner Loft"}}),r.jsx(a,{data:{...n,name:"Riverside Suite"}}),r.jsx(a,{data:{...n,name:"Downtown Studio"}})]})}},o={args:{children:r.jsx(r.Fragment,{children:Array.from({length:12},(d,e)=>r.jsx(a,{data:{...n,name:`Property ${e+1}`,businessAddr:`Address ${e+1}`,leaseManager:`Contact ${e+1}`}},e))})},parameters:{docs:{description:{story:"Shows the responsive grid behavior with 12 items. Grid automatically adjusts columns based on container width."}}}},i={args:{children:r.jsx(r.Fragment,{children:Array.from({length:6},(d,e)=>r.jsx(a,{data:{...n,name:`Card ${e+1}`,note:`Sample content for card ${e+1}`}},e))})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        <Property data={sampleProperty} />
        <Property data={{
        ...sampleProperty,
        name: 'Corner Loft'
      }} />
        <Property data={{
        ...sampleProperty,
        name: 'Riverside Suite'
      }} />
        <Property data={{
        ...sampleProperty,
        name: 'Downtown Studio'
      }} />
      </>
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        {Array.from({
        length: 12
      }, (_, i) => <Property key={i} data={{
        ...sampleProperty,
        name: \`Property \${i + 1}\`,
        businessAddr: \`Address \${i + 1}\`,
        leaseManager: \`Contact \${i + 1}\`
      }} />)}
      </>
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the responsive grid behavior with 12 items. Grid automatically adjusts columns based on container width.'
      }
    }
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        {Array.from({
        length: 6
      }, (_, i) => <Property key={i} data={{
        ...sampleProperty,
        name: \`Card \${i + 1}\`,
        note: \`Sample content for card \${i + 1}\`
      }} />)}
      </>
  }
}`,...i.parameters?.docs?.source}}};const C=["Empty","WithCards","ManyItems","WithContent"];export{t as Empty,o as ManyItems,s as WithCards,i as WithContent,C as __namedExportsOrder,x as default};
