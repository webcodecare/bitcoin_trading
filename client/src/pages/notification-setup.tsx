import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Bell, 
  Send, 
  CheckCircle, 
  ExternalLink,
  Settings,
  AlertTriangle,
  Info
} from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'telegram' | 'discord' | 'webhook';
  icon: React.ReactNode;
  enabled: boolean;
  configured: boolean;
  description: string;
  setupSteps: string[];
}

export default function NotificationSetup() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      name: 'Email Notifications',
      type: 'email',
      icon: <Mail className="h-5 w-5" />,
      enabled: true,
      configured: true,
      description: 'Receive trading signals via email',
      setupSteps: ['Verify your email address', 'Enable email notifications in settings']
    },
    {
      id: 'sms',
      name: 'SMS/Text Messages',
      type: 'sms',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: false,
      configured: false,
      description: 'Get instant SMS alerts on your phone',
      setupSteps: [
        'Add your phone number',
        'Verify phone number with SMS code',
        'Configure Twilio API (Admin required)',
        'Enable SMS notifications'
      ]
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      type: 'telegram',
      icon: <MessageSquare className="h-5 w-5" />,
      enabled: false,
      configured: false,
      description: 'Receive signals via Telegram bot',
      setupSteps: [
        'Message @CryptoStrategyProBot on Telegram',
        'Send /start to activate',
        'Copy your Telegram Chat ID',
        'Paste Chat ID in settings below',
        'Test connection'
      ]
    },
    {
      id: 'discord',
      name: 'Discord Webhook',
      type: 'discord',
      icon: <MessageSquare className="h-5 w-5" />,
      enabled: false,
      configured: false,
      description: 'Send alerts to Discord channel',
      setupSteps: [
        'Create Discord webhook in your server',
        'Copy webhook URL',
        'Paste URL in settings below',
        'Test webhook connection'
      ]
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: '',
    phone: '',
    telegramChatId: '',
    discordWebhook: '',
    frequency: 'all', // all, important, daily_summary
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const toggleChannel = (channelId: string) => {
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, enabled: !channel.enabled }
          : channel
      )
    );
  };

  const testNotification = async (channelType: string) => {
    toast({
      title: "Test Notification Sent",
      description: `Test message sent via ${channelType}. Check your ${channelType} for the test alert.`,
    });
  };

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="ml-64 flex-1">
          {/* Header */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6" />
                <div>
                  <h1 className="text-2xl font-bold">Notification Setup</h1>
                  <p className="text-muted-foreground">Configure how you receive trading alerts</p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-400">
                Multi-Channel Alerts
              </Badge>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Quick Setup Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Quick Setup Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">Ready to use</p>
                    <Badge variant="outline" className="mt-2 text-green-600">Active</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold">SMS</h3>
                    <p className="text-sm text-muted-foreground">Add phone number</p>
                    <Badge variant="outline" className="mt-2 text-orange-600">Setup Required</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Telegram</h3>
                    <p className="text-sm text-muted-foreground">Message our bot</p>
                    <Badge variant="outline" className="mt-2 text-orange-600">Setup Required</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold">Discord</h3>
                    <p className="text-sm text-muted-foreground">Webhook URL needed</p>
                    <Badge variant="outline" className="mt-2 text-orange-600">Setup Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="channels" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="channels">Notification Channels</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="test">Test & Verify</TabsTrigger>
              </TabsList>

              {/* Notification Channels Tab */}
              <TabsContent value="channels" className="space-y-4">
                {channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {channel.icon}
                          <div>
                            <CardTitle className="text-lg">{channel.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{channel.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {channel.configured ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Configured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Setup Required
                            </Badge>
                          )}
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={() => toggleChannel(channel.id)}
                            disabled={!channel.configured}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Setup Steps:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {channel.setupSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        
                        {/* Channel-specific configuration */}
                        {channel.type === 'sms' && (
                          <div className="space-y-3 border-t pt-4">
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                placeholder="+1234567890"
                                value={notificationSettings.phone}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  phone: e.target.value
                                }))}
                              />
                            </div>
                            <Button size="sm" variant="outline">
                              <Send className="h-4 w-4 mr-2" />
                              Send Verification Code
                            </Button>
                          </div>
                        )}
                        
                        {channel.type === 'telegram' && (
                          <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <MessageSquare className="h-5 w-5 text-blue-600" />
                              <div className="text-sm">
                                <p className="font-semibold">Telegram Bot: @CryptoStrategyProBot</p>
                                <p className="text-muted-foreground">Message the bot with /start to get your Chat ID</p>
                              </div>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Telegram
                              </Button>
                            </div>
                            <div>
                              <Label htmlFor="telegram">Telegram Chat ID</Label>
                              <Input
                                id="telegram"
                                placeholder="123456789"
                                value={notificationSettings.telegramChatId}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  telegramChatId: e.target.value
                                }))}
                              />
                            </div>
                          </div>
                        )}
                        
                        {channel.type === 'discord' && (
                          <div className="space-y-3 border-t pt-4">
                            <div>
                              <Label htmlFor="discord">Discord Webhook URL</Label>
                              <Input
                                id="discord"
                                placeholder="https://discord.com/api/webhooks/..."
                                value={notificationSettings.discordWebhook}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  discordWebhook: e.target.value
                                }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        value={notificationSettings.email}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-base font-semibold">Notification Frequency</Label>
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="all"
                            name="frequency"
                            checked={notificationSettings.frequency === 'all'}
                            onChange={() => setNotificationSettings(prev => ({ ...prev, frequency: 'all' }))}
                          />
                          <Label htmlFor="all">All Signals (Real-time)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="important"
                            name="frequency"
                            checked={notificationSettings.frequency === 'important'}
                            onChange={() => setNotificationSettings(prev => ({ ...prev, frequency: 'important' }))}
                          />
                          <Label htmlFor="important">Important Signals Only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="summary"
                            name="frequency"
                            checked={notificationSettings.frequency === 'daily_summary'}
                            onChange={() => setNotificationSettings(prev => ({ ...prev, frequency: 'daily_summary' }))}
                          />
                          <Label htmlFor="summary">Daily Summary</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Switch
                          checked={notificationSettings.quietHours.enabled}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, enabled: checked }
                          }))}
                        />
                        <Label>Enable Quiet Hours</Label>
                      </div>
                      
                      {notificationSettings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={notificationSettings.quietHours.start}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, start: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={notificationSettings.quietHours.end}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, end: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button onClick={saveSettings} className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Test & Verify Tab */}
              <TabsContent value="test" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Notifications</CardTitle>
                    <p className="text-muted-foreground">Send test messages to verify your notification channels</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {channels.filter(channel => channel.configured).map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {channel.icon}
                            <div>
                              <h3 className="font-semibold">{channel.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {channel.enabled ? 'Active' : 'Disabled'}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => testNotification(channel.type)}
                            disabled={!channel.enabled}
                            size="sm"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {channels.filter(channel => channel.configured).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No notification channels configured yet.</p>
                        <p>Set up your channels in the Notification Channels tab.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}