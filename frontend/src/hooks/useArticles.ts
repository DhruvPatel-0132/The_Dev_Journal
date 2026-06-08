"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articleApi } from "@/lib/api";
import { Article } from "@/types";

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (params: Record<string, any>) => [...articleKeys.lists(), params] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
  myArticles: (params?: Record<string, any>) => [...articleKeys.all, "my", params] as const,
  dashboardStats: () => [...articleKeys.all, "dashboard-stats"] as const,
  categories: () => [...articleKeys.all, "categories"] as const,
  tags: () => [...articleKeys.all, "tags"] as const,
};

// ─── Feed: Published Articles ────────────────────────────────────────────────
export function useArticles(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: () => articleApi.getAllArticles(params),
    placeholderData: (prev) => prev, // keep previous data while fetching
  });
}

// ─── Filter Data ─────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: articleKeys.categories(),
    queryFn: () => articleApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 min — categories change rarely
  });
}

export function useTags() {
  return useQuery({
    queryKey: articleKeys.tags(),
    queryFn: () => articleApi.getTags(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: articleKeys.dashboardStats(),
    queryFn: () => articleApi.getDashboardStats(),
  });
}

export function useMyArticles(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: articleKeys.myArticles(params),
    queryFn: () => articleApi.getMyArticles(params),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Article>) => articleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<Article> }) =>
      articleApi.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => articleApi.deleteArticle(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

export function useArchiveArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => articleApi.archiveArticle(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

export function useToggleLike() {
  return useMutation({
    mutationFn: (slug: string) => articleApi.toggleLike(slug),
  });
}

export function useToggleDislike() {
  return useMutation({
    mutationFn: (slug: string) => articleApi.toggleDislike(slug),
  });
}
