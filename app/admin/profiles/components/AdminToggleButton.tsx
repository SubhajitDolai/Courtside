'use client'

import { Button } from '@/components/ui/button'
import { Shield, ShieldOff, Loader } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface AdminToggleButtonProps {
  userId: string
  currentRole: string
  userEmail: string
  onRoleChange: () => void
}

export default function AdminToggleButton({ 
  userId, 
  currentRole, 
  userEmail, 
  onRoleChange 
}: AdminToggleButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const isAdmin = currentRole === 'admin'
  
  const handleRoleToggle = async () => {
    setLoading(true)
    
    try {
      const newRole = isAdmin ? 'user' : 'admin'
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) throw error
      
      toast.success(
        isAdmin 
          ? `Removed admin access for ${userEmail}` 
          : `Granted admin access to ${userEmail}`
      )
      
      onRoleChange()
      
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update admin role')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button
      onClick={handleRoleToggle}
      disabled={loading}
      variant={isAdmin ? "destructive" : "default"}
      size="sm"
      className={
        isAdmin
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-green-600 hover:bg-green-700 text-white"
      }
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          {isAdmin ? 'Removing...' : 'Granting...'}
        </>
      ) : (
        <>
          {isAdmin ? (
            <>
              <ShieldOff className="w-4 h-4 mr-2" />
              Remove Admin
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Make Admin
            </>
          )}
        </>
      )}
    </Button>
  )
}
