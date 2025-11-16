import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Lock } from "lucide-react";

export default function AdminAuthGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        alert("Admin access required");
        base44.auth.redirectToLogin();
        return;
      }
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <CardTitle>Admin Access Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Please sign in with admin credentials to continue
            </p>
            <Button 
              onClick={() => base44.auth.redirectToLogin()} 
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}