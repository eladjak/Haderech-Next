import { Heebo, Rubik } from "next/font/google";

export const fontSans = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-sans",
});

export const fontHeading = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-heading",
});
