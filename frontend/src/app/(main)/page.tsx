import { redirect } from "next/navigation";

export default function MainPage() {
  redirect("/auth/sign-in");
}
