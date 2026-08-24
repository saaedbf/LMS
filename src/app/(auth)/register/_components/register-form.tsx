"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  registerSchema,
  type RegisterFormInput,
  type RegisterInput,
  schoolRoles,
} from "@/lib/schemas/register.schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

type School = {
  id: number;
  title: string;
};

type AcademicYear = {
  id: number;
  title: string;
  isActive: boolean;
};

type Props = {
  schools: School[];
  academicYears: AcademicYear[];
};

export default function RegisterForm({ schools, academicYears }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const defaultAcademicYear = useMemo(() => {
    return academicYears[0];
  }, [academicYears]);

  const form = useForm<RegisterFormInput, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      schoolId: undefined,
      academicYearId: defaultAcademicYear?.id,
      schoolRole: undefined,
      makeMaster: false,
    },
  });

  const schoolRole = form.watch("schoolRole");

  async function onSubmit(values: RegisterInput) {
    try {
      setServerError("");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.message || "ثبت‌ نام انجام نشد");
        return;
      }

      router.push("/login");
    } catch {
      setServerError("خطای غیرمنتظره رخ داد");
    }
  }

  function generateTestEmail() {
    const random = Math.floor(Math.random() * 999999);
    form.setValue("email", `test-${Date.now()}-${random}@example.com`, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ثبت‌نام تستی</CardTitle>
        <CardDescription>ساخت سریع کاربر تستی برای توسعه</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {serverError ? (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام</FormLabel>
                    <FormControl>
                      <Input placeholder="علی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="محمدی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>ایمیل</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateTestEmail}
                    >
                      ساخت ایمیل تستی
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      dir="ltr"
                      placeholder="test@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تکرار رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-xl border p-4">
              <div className="space-y-1">
                <h2 className="font-semibold">نقش و assignment</h2>
                <p className="text-sm text-muted-foreground">
                  برای تست سریع داشبورد
                </p>
              </div>

              <FormField
                control={form.control}
                name="makeMaster"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <FormLabel>کاربر MASTER شود</FormLabel>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="schoolRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نقش</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value || undefined)
                        }
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب نقش" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schoolRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مدرسه</FormLabel>
                      <Select
                        disabled={!schoolRole}
                        onValueChange={(value) =>
                          field.onChange(value ? Number(value) : undefined)
                        }
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب مدرسه" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem
                              key={school.id}
                              value={String(school.id)}
                            >
                              {school.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYearId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سال تحصیلی</FormLabel>
                      <Select
                        disabled={!schoolRole}
                        onValueChange={(value) =>
                          field.onChange(value ? Number(value) : undefined)
                        }
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="سال تحصیلی" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears.map((year, index) => (
                            <SelectItem key={year.id} value={String(year.id)}>
                              {year.title}
                              {index === 0 ? " (پیش‌فرض)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "در حال ساخت..."
                : "ساخت کاربر تستی"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
