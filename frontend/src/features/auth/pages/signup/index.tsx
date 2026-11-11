import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SignupForm } from "./SignupForm";

export function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Preencha os dados para se cadastrar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
