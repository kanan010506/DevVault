import { supabase } from './lib/supabaseClient'

function App() {
  console.log('Supabase client:', supabase)

  return (
    <div className="bg-gray-900 text-white text-2xl p-8">
      DevVault is connected!
    </div>
  )
}

export default App