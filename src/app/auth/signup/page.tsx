"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, SmilePlus, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthAlert } from "@/features/auth/components/ui/auth-alert";
import { Benefit } from "@/features/auth/components/ui/auth-icons";
import {
  type SignUpFormValues,
  signUpSchema,
} from "@/features/auth/types/forms";

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors("root");

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        const message = data?.message ?? "가입 중 오류가 발생했습니다.";
        form.setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success("회원가입이 완료되었습니다. 로그인 해주세요.");
      router.push("/auth/signin?registered=1");
    } catch (error) {
      console.error("signUp request failed", error);
      const message =
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      form.setError("root", { message });
      toast.error(message);
    }
  });

  const isSubmitting = form.formState.isSubmitting;
  const rootError = form.formState.errors.root?.message ?? null;

  return (
    <div className="relative isolate overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 select-none">
        <div className="absolute -top-36 right-1/2 h-[420px] w-[420px] translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-44 left-4 h-[340px] w-[340px] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-14 top-1/3 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 rounded-3xl border border-border/60 bg-background/92 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl md:grid-cols-[1.05fr_1fr] md:p-12 lg:gap-14">
        <section className="flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              create account
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                팀과 프로젝트를 한 번에 관리할 수 있는 계정을 생성하세요
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                몇 번의 클릭만으로 안전한 계정을 만들고, Google OAuth와 연동된
                통합 인증 환경을 경험해보세요.
              </p>
            </div>
          </div>
          <ul className="grid gap-4 text-sm text-muted-foreground">
            <Benefit
              icon={Sparkles}
              title="원활한 온보딩"
              description="Google 계정 연동으로 1분만에 시작"
            />
            <Benefit
              icon={ShieldCheck}
              title="보안 중심 설계"
              description="bcrypt 해시 저장과 Auth.js 세션 보호"
            />
            <Benefit
              icon={SmilePlus}
              title="유연한 확장"
              description="여러 OAuth 프로바이더를 손쉽게 추가"
            />
          </ul>
        </section>

        <Card className="border-none bg-background/95 shadow-lg shadow-primary/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold">회원가입</CardTitle>
            <p className="text-sm text-muted-foreground">
              계정 정보를 입력하고 Next Boilerplate의 모든 기능을 사용해보세요.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {rootError && <AuthAlert tone="error">{rootError}</AuthAlert>}

            <Form {...form}>
              <form onSubmit={submit} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="홍길동"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="8자 이상 입력"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        문자, 숫자 조합으로 8자 이상 입력해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      가입 처리중...
                    </span>
                  ) : (
                    "계정 생성하기"
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-primary hover:text-primary/80"
              >
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
