# 🚀 How to Deploy Your Website to the Web

This guide will walk you through deploying your Next.js + Sanity website to **Vercel**, the best hosting platform for Next.js.

## ✅ Prerequisites

1.  **GitHub Account**: You need a GitHub account to store your code.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.

---

## 📦 Step 1: Push Your Code to GitHub

Since we've already initialized Git locally, you just need to push it to a new repository.

1.  Go to [GitHub.com](https://github.com) and create a **New Repository**.
    *   Name it `usa-graphene` (or similar).
    *   Make it **Private** or **Public**.
    *   **Do not** initialize with README, .gitignore, or license (we already have them).

2.  Copy the commands under **"…or push an existing repository from the command line"**. They will look like this:

    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/usa-graphene.git
    git branch -M main
    git push -u origin main
    ```

3.  Run those commands in your terminal.

---

## ☁️ Step 2: Deploy to Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  You should see your `usa-graphene` repository in the list. Click **"Import"**.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**: You need to copy these from your `.env.local` file.
        *   Expand the "Environment Variables" section.
        *   Add the following (copy values from your local `.env.local`):
            *   `NEXT_PUBLIC_SANITY_PROJECT_ID`
            *   `NEXT_PUBLIC_SANITY_DATASET`
            *   `NEXT_PUBLIC_SANITY_API_VERSION`
            *   `SANITY_API_TOKEN` (Optional for frontend, but good to have)

5.  Click **"Deploy"**.

Vercel will build your site and give you a live URL (e.g., `usa-graphene.vercel.app`).

---

## ⚙️ Step 3: Configure Sanity for Production

Now that your site is live, you need to tell Sanity that it's allowed to talk to your new domain.

1.  Go to [Sanity Manage](https://www.sanity.io/manage).
2.  Select your project (`t9t7is4j`).
3.  Go to **API** tab -> **CORS Origins**.
4.  Click **"Add CORS Origin"**.
5.  Enter your new Vercel URL (e.g., `https://usa-graphene.vercel.app`).
6.  Check **"Allow credentials"**.
7.  Click **"Save"**.

---

## 🖥️ Step 4: Accessing Sanity Studio in Production

We have configured your Studio to live at `/studio` on your website.

Once deployed, you can access your admin panel at:
**`https://YOUR-VERCEL-URL.vercel.app/studio`**

(Note: You might need to log in again).

---

## 🔄 Updating Your Site

Whenever you want to update your code:
1.  Make changes locally.
2.  Commit and push to GitHub:
    ```bash
    git add .
    git commit -m "Description of changes"
    git push
    ```
3.  Vercel will **automatically** detect the change and redeploy your site!

---

## 🎉 You're Live!

Your professional Graphene website is now on the web!
