import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar produtos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/signup" className="text-primary underline">
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
