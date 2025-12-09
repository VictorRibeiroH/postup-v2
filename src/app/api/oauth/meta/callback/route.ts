import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // 'facebook' ou 'instagram'
  const error = searchParams.get("error");

  // Se usuário negou permissão
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/social-accounts?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/social-accounts?error=no_code", request.url)
    );
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Trocar code por access_token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${process.env.NEXT_PUBLIC_META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&code=${code}` +
      `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_META_REDIRECT_URI!)}`
    );

    if (!tokenResponse.ok) {
      throw new Error("Erro ao obter access token");
    }

    const { access_token } = await tokenResponse.json();

    // Trocar short-lived token por long-lived token (60 dias)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${process.env.NEXT_PUBLIC_META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&fb_exchange_token=${access_token}`
    );

    const { access_token: longLivedToken, expires_in } = await longLivedResponse.json();

    // Buscar páginas do Facebook do usuário
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );
    const { data: pages } = await pagesResponse.json();

    if (!pages || pages.length === 0) {
      return NextResponse.redirect(
        new URL("/dashboard/social-accounts?error=no_pages", request.url)
      );
    }

    // Salvar cada página no banco
    for (const page of pages) {
      // Buscar informações da página
      const pageInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?` +
        `fields=name,username,picture,category,fan_count` +
        `&access_token=${page.access_token}`
      );
      const pageInfo = await pageInfoResponse.json();

      // Verificar se tem Instagram vinculado
      let instagramAccount = null;
      if (state === "instagram") {
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?` +
          `fields=instagram_business_account{id,username,profile_picture_url,followers_count}` +
          `&access_token=${page.access_token}`
        );
        const igData = await igResponse.json();
        instagramAccount = igData.instagram_business_account;
      }

      // Salvar Facebook Page
      await supabase.from("social_accounts").upsert({
        user_id: user.id,
        platform: "facebook",
        account_id: page.id,
        account_name: pageInfo.name || page.name,
        account_username: pageInfo.username || null,
        account_picture: pageInfo.picture?.data?.url || null,
        access_token: page.access_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        page_category: pageInfo.category || null,
        followers_count: pageInfo.fan_count || 0,
        is_active: true,
      }, {
        onConflict: "user_id,platform,account_id",
      });

      // Salvar Instagram se existir
      if (instagramAccount) {
        await supabase.from("social_accounts").upsert({
          user_id: user.id,
          platform: "instagram",
          account_id: instagramAccount.id,
          account_name: pageInfo.name, // Nome da página associada
          account_username: instagramAccount.username,
          account_picture: instagramAccount.profile_picture_url,
          access_token: page.access_token, // Usa o token da página
          token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          followers_count: instagramAccount.followers_count || 0,
          is_active: true,
        }, {
          onConflict: "user_id,platform,account_id",
        });
      }
    }

    return NextResponse.redirect(
      new URL("/dashboard/social-accounts?success=true", request.url)
    );
  } catch (error) {
    console.error("Erro no OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard/social-accounts?error=callback_failed", request.url)
    );
  }
}
