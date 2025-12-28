import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (userData: { username: string; password: string; email: string, fullName: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onRegister }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', email: '', fullName: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginData.username, loginData.password);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(registerData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl text-center">Welcome!</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/20">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-white/30">Login</TabsTrigger>
            <TabsTrigger value="register" className="text-white data-[state=active]:bg-white/30">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-purple hover:bg-gradient-pink text-white">
                Login
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-username" className="text-white">Username</Label>
                <Input
                  id="reg-username"
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Choose a username"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reg-email" className="text-white">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reg-fullName" className="text-white">Full Name</Label>
                <Input
                  id="reg-fullName"
                  type="text"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reg-password" className="text-white">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Choose a password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-purple hover:bg-gradient-pink text-white">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
