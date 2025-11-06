import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Database, Package } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { AssetModal } from "../components/modals/asset-modal"
import { BaseModal } from "../components/modals/base-modal"
import { DeleteConfirmationModal } from "../components/modals/delete-confirmation-modal"
import { assetsAPI, basesAPI } from "../services/api"
import { useAssetBase } from "../context/AssetBaseContext"
import { toast } from "sonner"

const assetColumns = [
  // { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "unit", label: "Unit" },
  { key: "description", label: "Description" },
  { key: "createdAt", label: "Created At" },
]

const baseColumns = [
  // { key: "_id", label: "ID" },
  { key: "name", label: "Base Name" },
  { key: "district", label: "District" },
  { key: "state", label: "State" },
  { key: "createdAt", label: "Created At" },
]

export const SettingsPage = () => {
  const {
    assets,
    bases,
    loading,
    fetchData,
  } = useAssetBase()

  console.log("Assets", assets);
  console.log("Bases", bases);

  // Modal states
  const [assetModal, setAssetModal] = useState({
    isOpen: false,
    mode: "create", // "create" or "edit"
    data: null,
  })

  const [baseModal, setBaseModal] = useState({
    isOpen: false,
    mode: "create", // "create" or "edit"
    data: null,
  })

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "", // "asset" or "base"
    data: null,
  })

  // Fetch data on component mount only if data doesn't exist
  useEffect(() => {
    if (
      (!assets || assets.length === 0) &&
      (!bases || bases.length === 0)
    ) {
      fetchData();
    }
  }, [assets, bases]);



  // Asset handlers
  const handleCreateAsset = () => {
    setAssetModal({
      isOpen: true,
      mode: "create",
      data: null,
    })
  }

  const handleEditAsset = (asset) => {
    setAssetModal({
      isOpen: true,
      mode: "edit",
      data: asset,
    })
  }

  const handleDeleteAsset = (asset) => {
    setDeleteModal({
      isOpen: true,
      type: "asset",
      data: asset,
    })
  }

  const handleSaveAsset = async (formData) => {
    try {
      if (assetModal.mode === "create") {
        await assetsAPI.create(formData)
        toast("Asset created successfully", "success")

      } else {
        await assetsAPI.update(assetModal.data._id, formData)
        toast("Asset updated successfully", "success")

      }
      setAssetModal({ isOpen: false, mode: "create", data: null })
      fetchData()
    } catch (error) {
      toast(error?.message || "Failed to save asset", "error")

    }
  }

  // Base handlers
  const handleCreateBase = () => {
    setBaseModal({
      isOpen: true,
      mode: "create",
      data: null,
    })
  }

  const handleEditBase = (base) => {
    setBaseModal({
      isOpen: true,
      mode: "edit",
      data: base,
    })
  }

  const handleDeleteBase = (base) => {
    setDeleteModal({
      isOpen: true,
      type: "base",
      data: base,
    })
  }

  const handleSaveBase = async (formData) => {
    try {
      if (baseModal.mode === "create") {
        await basesAPI.create(formData)
        toast("Base created successfully", "success")

      } else {
        await basesAPI.update(baseModal.data._id, formData)
        toast("Base updated successfully", "success")

      }
      setBaseModal({ isOpen: false, mode: "create", data: null })
      fetchData()
    } catch (error) {
      toast(error?.message || "Failed to save base", "error")

    }
  }

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === "asset") {
        await assetsAPI.delete(deleteModal.data._id)
        toast("Asset deleted successfully", "success")

      } else {
        await basesAPI.delete(deleteModal.data._id)
        toast("Base deleted successfully", "success")

      }
      setDeleteModal({ isOpen: false, type: "", data: null })
      fetchData()
    } catch (error) {
      toast(error?.message || "Failed to delete asset", "error")

    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="md:text-3xl text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your assets and bases configuration</p>
        </div>
      </div>

      <Tabs defaultValue="bases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bases" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Bases
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Title and Description */}
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Package className="h-5 w-5" />
                    Assets Management
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your asset inventory and track their details
                  </CardDescription>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleCreateAsset}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Asset
                </Button>
              </div>
            </CardHeader>

            <CardContent className='md:px-4 p-3 py-0'>
              <DataTable columns={assetColumns} data={assets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bases" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left Side - Title & Description */}
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Database className="h-5 w-5" />
                    Bases Management
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Configure and manage your operational bases
                  </CardDescription>
                </div>

                {/* Right Side - Create Button */}
                <Button
                  onClick={handleCreateBase}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Base
                </Button>
              </div>
            </CardHeader>

            <CardContent className='md:px-4 p-3 py-0'>
              <DataTable columns={baseColumns} data={bases} onEdit={handleEditBase} onDelete={handleDeleteBase} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AssetModal
        isOpen={assetModal.isOpen}
        onClose={() => setAssetModal({ isOpen: false, mode: "create", data: null })}
        onSave={handleSaveAsset}
        asset={assetModal.data}
        mode={assetModal.mode}
      />

      <BaseModal
        isOpen={baseModal.isOpen}
        onClose={() => setBaseModal({ isOpen: false, mode: "create", data: null })}
        onSave={handleSaveBase}
        base={baseModal.data}
        mode={baseModal.mode}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: "", data: null })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteModal.type === "asset" ? "Asset" : "Base"}`}
        description={`Are you sure you want to delete this ${deleteModal.type}:`}
        itemName={deleteModal.data?.name || ""}
      />
    </div>
  )
}
