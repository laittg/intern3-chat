import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, CheckCircle, Key, Keyboard, Settings, Shield, Sparkles, Star, User, Zap } from "lucide-react"
import { memo, useMemo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/hooks/auth-hooks"

export const Route = createFileRoute("/auth/settings")({
    component: SettingsPage
})

const UserProfileCard = memo(({ 
    user, 
    standardUsage, 
    standardLimit, 
    premiumUsage, 
    premiumLimit 
}: {
    user: any
    standardUsage: number
    standardLimit: number
    premiumUsage: number
    premiumLimit: number
}) => {
    const standardPercentage = useMemo(() => (standardUsage / standardLimit) * 100, [standardUsage, standardLimit])
    const premiumPercentage = useMemo(() => (premiumUsage / premiumLimit) * 100, [premiumUsage, premiumLimit])
    const remainingStandard = useMemo(() => standardLimit - standardUsage, [standardLimit, standardUsage])
    const remainingPremium = useMemo(() => premiumLimit - premiumUsage, [premiumLimit, premiumUsage])

    return (
        <Card className="border-2">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-xl font-bold mb-1">{user?.name || 'User'}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                    
                    <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Pro Plan
                    </Badge>

                    {/* Message Usage */}
                    <div className="w-full space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Standard</span>
                                <span className="text-muted-foreground">{standardUsage}/{standardLimit}</span>
                            </div>
                            <Progress value={standardPercentage} className="h-2" />
                            <p className="text-xs text-muted-foreground">{remainingStandard} messages remaining</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Premium</span>
                                <span className="text-muted-foreground">{premiumUsage}/{premiumLimit}</span>
                            </div>
                            <Progress value={premiumPercentage} className="h-2" />
                            <p className="text-xs text-muted-foreground">{remainingPremium} messages remaining</p>
                        </div>

                        <Button variant="outline" className="w-full mt-4">
                            <Star className="w-4 h-4 mr-2" />
                            Buy more premium credits
                            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})

const KeyboardShortcuts = memo(() => (
    <Card className="mt-6">
        <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm">Search</span>
                <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">K</kbd>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm">New Chat</span>
                <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">⇧</kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">O</kbd>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm">Toggle Sidebar</span>
                <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">B</kbd>
                </div>
            </div>
        </CardContent>
    </Card>
))

function SettingsPage() {
    const { data: session } = useSession()
    const user = session?.user

    const usageData = useMemo(() => ({
        standard: { usage: 145, limit: 1500 },
        premium: { usage: 4, limit: 100 }
    }), [])

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="shrink-0">
                        <Link to="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">Manage your account and preferences</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <UserProfileCard
                            user={user}
                            standardUsage={usageData.standard.usage}
                            standardLimit={usageData.standard.limit}
                            premiumUsage={usageData.premium.usage}
                            premiumLimit={usageData.premium.limit}
                        />
                        
                        <KeyboardShortcuts />
                    </div>

                    {/* Main Settings Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="account" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="account" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Account
                                </TabsTrigger>
                                <TabsTrigger value="security" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger value="api-keys" className="flex items-center gap-2">
                                    <Key className="h-4 w-4" />
                                    API Keys
                                </TabsTrigger>
                                <TabsTrigger value="preferences" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Preferences
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="account" className="space-y-6">
                                {/* Pro Plan Benefits */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            Pro Plan Benefits
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                    <span className="font-medium">Access to All Models</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Get access to our full suite of models including Claude, o3-mini-high, and more!
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-5 w-5 text-yellow-500" />
                                                    <span className="font-medium">Generous Limits</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive <strong>1500 standard credits</strong> per month, plus <strong>100 premium credits</strong> per month.
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-5 w-5 text-blue-500" />
                                                    <span className="font-medium">Priority Support</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Get faster responses and dedicated assistance from the T3 team whenever you need help!
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <Separator className="my-6" />
                                        
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-muted-foreground">
                                                * Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok 3. Additional Premium credits can be purchased separately.
                                            </p>
                                        </div>
                                        
                                        <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                            Manage Subscription
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Account Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Information</CardTitle>
                                        <CardDescription>Update your account details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Full Name</div>
                                                <p className="text-sm text-muted-foreground">{user?.name}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Email</div>
                                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Member Since</div>
                                                <p className="text-sm text-muted-foreground">
                                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Plan</div>
                                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                                    Pro Plan
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Security Settings</CardTitle>
                                        <CardDescription>Manage your account security</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Password</h4>
                                                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                                                </div>
                                                <Button variant="outline">Change Password</Button>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Two-Factor Authentication</h4>
                                                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                                </div>
                                                <Button variant="outline">Enable 2FA</Button>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Active Sessions</h4>
                                                    <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                                                </div>
                                                <Button variant="outline">View Sessions</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="api-keys" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>API Keys</CardTitle>
                                        <CardDescription>Manage your API keys for external integrations</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="text-center py-8">
                                                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <h3 className="font-medium mb-2">No API Keys</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Create your first API key to start integrating with external services
                                                </p>
                                                <Button>Create API Key</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="preferences" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preferences</CardTitle>
                                        <CardDescription>Customize your experience</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Theme</h4>
                                                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                                                </div>
                                                <Button variant="outline">Change Theme</Button>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Language</h4>
                                                    <p className="text-sm text-muted-foreground">Select your language preference</p>
                                                </div>
                                                <Button variant="outline">English</Button>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">Notifications</h4>
                                                    <p className="text-sm text-muted-foreground">Manage your notification settings</p>
                                                </div>
                                                <Button variant="outline">Configure</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Danger Zone */}
                        <Card className="border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>
                                    Permanently delete your account and all associated data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="destructive">Delete Account</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(SettingsPage)