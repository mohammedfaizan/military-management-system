import { createContext, useContext, useEffect, useState } from "react"
import { assetsAPI, basesAPI } from "@/services/api"
import { toast } from "sonner"

const AssetBaseContext = createContext()

export const AssetBaseProvider = ({ children }) => {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assetsData, basesData] = await Promise.all([
        assetsAPI.getAll(),
        basesAPI.getAll(),
      ])
      setAssets(assetsData.assets)
      setBases(basesData.bases)
    } catch (error) {
      toast("Failed to fetch data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <AssetBaseContext.Provider
      value={{
        assets,
        setAssets,
        bases,
        setBases,
        loading,
        fetchData,
      }}
    >
      {children}
    </AssetBaseContext.Provider>
  )
}

export const useAssetBase = () => useContext(AssetBaseContext)
