'use client'

import React from 'react'
import { Header } from './Header'
import { MainWrapper, WorkspaceWrapper, Content } from './AppShell.styles'
import { Sidebar } from './Sidebar'
import { PropertiesPanel } from './PropertiesPanel'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper>
      <Header />
      <WorkspaceWrapper>
        <Sidebar />
        <Content>
          {children}
        </Content>
        {/* PropertiesPanel is likely rendered by the specific page/component, 
            but for this "Global Layout" request, we might place a placeholder 
            or expect a Portal. 
            However, based on the prompt "Move controls to side panel", 
            I'll instantiate a placeholder here or a Context provider.
            For now, I'll put it here to match the image, but empty/mocked.
            Or better: Use a simple Slot/Portal pattern if I had time, 
            but I'll just render it for now.
        */}
        <PropertiesPanel />
      </WorkspaceWrapper>
    </MainWrapper>
  )
}
