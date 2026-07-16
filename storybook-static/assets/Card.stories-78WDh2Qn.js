import{j as e}from"./iframe-DnqJuSJ7.js";import{C as r}from"./Card-B6qyuBiw.js";import"./preload-helper-PPVm8Dsz.js";const l={title:"UI/Card",component:r,tags:["autodocs"],argTypes:{$width:{control:"text",description:"Width of the card (CSS value)"},$height:{control:"text",description:"Height of the card (CSS value)"},children:{control:"text",description:"Card content"}}},t={args:{children:"This is a card"}},a={args:{$width:"400px",children:"Card with 400px width"}},s={args:{$height:"100px",children:"Card with 100px height"}},n={args:{$width:"600px",$height:"120px",children:"Card with custom width and height"}},i={args:{$width:"500px",children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px",width:"100%"},children:[e.jsx("h3",{style:{margin:0},children:"Card Title"}),e.jsx("p",{style:{margin:0},children:"This card contains structured content with a title and description."})]})}},d={args:{$width:"600px",children:e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"Left content"}),e.jsx("span",{children:"Right content"})]})}},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx(r,{$width:"300px",children:"Small card (300px)"}),e.jsx(r,{$width:"500px",children:"Medium card (500px)"}),e.jsx(r,{$width:"800px",children:"Large card (800px)"}),e.jsx(r,{$width:"100%",children:"Full width card"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'This is a card'
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    $width: '400px',
    children: 'Card with 400px width'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    $height: '100px',
    children: 'Card with 100px height'
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    $width: '600px',
    $height: '120px',
    children: 'Card with custom width and height'
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    $width: '500px',
    children: <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%'
    }}>
        <h3 style={{
        margin: 0
      }}>Card Title</h3>
        <p style={{
        margin: 0
      }}>
          This card contains structured content with a title and description.
        </p>
      </div>
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    $width: '600px',
    children: <>
        <span>Left content</span>
        <span>Right content</span>
      </>
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <Card $width="300px">Small card (300px)</Card>
      <Card $width="500px">Medium card (500px)</Card>
      <Card $width="800px">Large card (800px)</Card>
      <Card $width="100%">Full width card</Card>
    </div>
}`,...c.parameters?.docs?.source}}};const m=["Default","CustomWidth","CustomHeight","CustomSize","WithContent","SpaceBetween","MultipleSizes"];export{s as CustomHeight,n as CustomSize,a as CustomWidth,t as Default,c as MultipleSizes,d as SpaceBetween,i as WithContent,m as __namedExportsOrder,l as default};
