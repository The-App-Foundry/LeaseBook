import{j as t}from"./iframe-DnqJuSJ7.js";import{B as e}from"./Button-DB7Vi8qc.js";import{c as u}from"./createLucideIcon-CZNb5f2f.js";import"./preload-helper-PPVm8Dsz.js";const d=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],l=u("plus",d),{fn:p}=__STORYBOOK_MODULE_TEST__,f={title:"UI/Button",component:e,tags:["autodocs"],argTypes:{$variant:{control:"select",options:["default","outline","ghost","destructive"],description:"The visual style variant of the button"},children:{control:"text",description:"Button content"}},args:{onClick:p()}},r={args:{$variant:"default",children:"Default Button"}},a={args:{$variant:"outline",children:"Outline Button"}},s={args:{$variant:"ghost",children:"Ghost Button"}},n={args:{$variant:"destructive",children:"Delete"}},o={args:{$variant:"default",children:t.jsxs(t.Fragment,{children:[t.jsx(l,{size:16}),"New Property"]})}},i={args:{className:"filter",children:"All Properties"}},c={render:()=>t.jsxs("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap"},children:[t.jsx(e,{$variant:"default",children:"Default"}),t.jsx(e,{$variant:"outline",children:"Outline"}),t.jsx(e,{$variant:"ghost",children:"Ghost"}),t.jsx(e,{$variant:"destructive",children:"Destructive"}),t.jsxs(e,{$variant:"default",children:[t.jsx(l,{size:16}),"With Icon"]}),t.jsx(e,{className:"filter",children:"Filter Style"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    $variant: 'default',
    children: 'Default Button'
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    $variant: 'outline',
    children: 'Outline Button'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    $variant: 'ghost',
    children: 'Ghost Button'
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    $variant: 'destructive',
    children: 'Delete'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    $variant: 'default',
    children: <>
        <Plus size={16} />
        New Property
      </>
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'filter',
    children: 'All Properties'
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  }}>
      <Button $variant="default">Default</Button>
      <Button $variant="outline">Outline</Button>
      <Button $variant="ghost">Ghost</Button>
      <Button $variant="destructive">Destructive</Button>
      <Button $variant="default">
        <Plus size={16} />
        With Icon
      </Button>
      <Button className="filter">Filter Style</Button>
    </div>
}`,...c.parameters?.docs?.source}}};const B=["Default","Outline","Ghost","Destructive","WithIcon","FilterButton","AllVariants"];export{c as AllVariants,r as Default,n as Destructive,i as FilterButton,s as Ghost,a as Outline,o as WithIcon,B as __namedExportsOrder,f as default};
