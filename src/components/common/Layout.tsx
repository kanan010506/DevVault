import {Sidebar} from './'
import '../../styles/layout.css'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  )
}

export default Layout