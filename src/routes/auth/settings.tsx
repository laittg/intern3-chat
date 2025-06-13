import { createFileRoute, Link } from "@tanstack/react-router"
import { useSession } from "@/hooks/auth-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
    ArrowLeft, 
    User, 
    Palette, 
    History, 
    Brain, 
    Key, 
    Paperclip, 
    Mail,
    Search,
    MessageSquarePlus,
    ToggleLeft,
    Trash2,
    Sparkles,
    Zap,
    HeadphonesIcon,
    Crown
} from "lucide-react"
import { useMemo } from "react"

export const Route = createFileRoute("/auth/settings")({
    component: SettingsPage
})

function SettingsPage() {
    const { data: session } = useSession()
    
    // Mock data - replace with real data sources
    const usageData = useMemo(() => ({
        standard: { used: 145, total: 1500, remaining: 1355 },
        premium: { used: 4, total: 100, remaining: 96 }
    }), [])

    const userInitials = useMemo(() => {
        if (!session?.user?.name) return "U"
        return session.user.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
    }, [session?.user?.name])

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chat
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                Sign out
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b">
                <div className="px-6">
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="h-12 w-full justify-start rounded-none border-0 bg-transparent p-0">
                            <TabsTrigger value="account" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                Account
                            </TabsTrigger>
                            <TabsTrigger value="customization" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                Customization
                            </TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                History & Sync
                            </TabsTrigger>
                            <TabsTrigger value="models" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                Models
                            </TabsTrigger>
                            <TabsTrigger value="api-keys" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                API Keys
                            </TabsTrigger>
                            <TabsTrigger value="attachments" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                Attachments
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none">
                                Contact Us
                            </TabsTrigger>
                        </TabsList>

                        {/* Account Tab Content */}
                        <TabsContent value="account" className="mt-0">
                            <div className="grid gap-6 py-6 lg:grid-cols-12">
                                {/* Left Column - Profile & Usage */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Profile Card */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col items-center text-center">
                                                <Avatar className="h-20 w-20 mb-4">
                                                    <AvatarImage src={session?.user?.image || ""} />
                                                    <AvatarFallback className="text-lg bg-gradient-to-br from-purple-400 to-blue-600 text-white">
                                                        {userInitials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h2 className="text-xl font-semibold mb-1">
                                                    {session?.user?.name || "User"}
                                                </h2>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {session?.user?.email || "user@example.com"}
                                                </p>
                                                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    Pro Plan
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Message Usage */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Message Usage</CardTitle>
                                                <span className="text-xs text-muted-foreground">Resets 07/02/2025</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Standard</span>
                                                    <span>{usageData.standard.used}/{usageData.standard.total}</span>
                                                </div>
                                                <Progress 
                                                    value={(usageData.standard.used / usageData.standard.total) * 100} 
                                                    className="h-2"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {usageData.standard.remaining} messages remaining
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="flex items-center gap-1">
                                                        Premium
                                                        <Sparkles className="h-3 w-3" />
                                                    </span>
                                                    <span>{usageData.premium.used}/{usageData.premium.total}</span>
                                                </div>
                                                <Progress 
                                                    value={(usageData.premium.used / usageData.premium.total) * 100} 
                                                    className="h-2"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {usageData.premium.remaining} messages remaining
                                                </p>
                                            </div>

                                            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                                Buy more premium credits →
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Keyboard Shortcuts */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
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
                                                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Shift</kbd>
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
                                </div>

                                {/* Right Column - Pro Plan Benefits */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-bold mb-6">Pro Plan Benefits</h1>
                                        
                                        <div className="grid gap-6 md:grid-cols-3">
                                            {/* Access to All Models */}
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-pink-500/10 rounded-lg">
                                                            <Zap className="h-5 w-5 text-pink-500" />
                                                        </div>
                                                        <h3 className="font-semibold">Access to All Models</h3>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get access to our full suite of models including Claude, o3-mini-high, and more!
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            {/* Generous Limits */}
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-pink-500/10 rounded-lg">
                                                            <Crown className="h-5 w-5 text-pink-500" />
                                                        </div>
                                                        <h3 className="font-semibold">Generous Limits</h3>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive <strong>1500 standard credits</strong> per month, plus <strong>100 premium credits</strong>* per month.
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            {/* Priority Support */}
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-pink-500/10 rounded-lg">
                                                            <HeadphonesIcon className="h-5 w-5 text-pink-500" />
                                                        </div>
                                                        <h3 className="font-semibold">Priority Support</h3>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get faster responses and dedicated assistance from the T3 team whenever you need help!
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Button className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                            Manage Subscription
                                        </Button>

                                        <p className="text-xs text-muted-foreground mt-4">
                                            * Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok 3. Additional Premium credits can be purchased separately.
                                        </p>
                                    </div>

                                    <Separator />

                                    {/* Danger Zone */}
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Danger Zone</h2>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Permanently delete your account and all associated data.
                                        </p>
                                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Other Tab Contents (placeholder for now) */}
                        <TabsContent value="customization" className="mt-0">
                            <div className="py-6">
                                <h2 className="text-xl font-semibold mb-4">Customization Settings</h2>
                                <p className="text-muted-foreground">Customization options will be available here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <div className="py-6">
                                <h2 className="text-xl font-semibold mb-4">History & Sync</h2>
                                <p className="text-muted-foreground">History and sync settings will be available here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="models" className="mt-0">
                            <div className="py-6">
                                <h2 className="text-xl font-semibold mb-4">Models</h2>
                                <p className="text-muted-foreground">Model configuration will be available here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="api-keys" className="mt-0">
                            <div className="py-6">
                                <h2 className="text-xl font-semibold mb-4">API Keys</h2>
                                <p className="text-muted-foreground">API key management will be available here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="attachments" className="mt-0">
                            <div className="py-6">
                                <h2 className="text-xl font-semibold mb-4">Attachments</h2>
                                <p className="text-muted-foreground">Attachment settings will be available here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact" className="mt-0">
                            <div className="py-6">
                                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                                <p className="text-muted-foreground">Contact information and support options will be available here.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}