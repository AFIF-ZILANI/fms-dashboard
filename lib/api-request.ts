import { useQuery, useMutation } from "@tanstack/react-query";

/**
 * A small helper that wraps fetch with JSON parsing + error handling.
 */

// console.log(`${process.env.SERVER_URI}/${process.env.API_VERSION}`);
// if (!process.env.SERVER_URI || !process.env.API_VERSION) {
//   throw Error("Server Base URL is missing!");
// }
// const server_URI = `${process.env.SERVER_URI}/${process.env.API_VERSION}`;
const server_URI = "/api";

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = isFormData
    ? options.headers || {}
    : {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

  const res = await fetch(server_URI + endpoint, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    // if backend sends JSON {message: "..."}
    if (isJson && body?.message) {
      throw new Error(body.message);
    }

    throw new Error(`Request failed: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;

  return body as T;
}


/* ------------------------- QUERY (GET) ------------------------- */

export function useGetData<T>(
  endpoint: string,
  options?: Parameters<typeof useQuery<T>>[0]
) {
  return useQuery<T>({
    queryKey: [endpoint],
    queryFn: () => fetchJson<T>(endpoint),
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

/* ------------------------- MUTATIONS ------------------------- */

/**
 * POST request
 */
export function usePostData<TInput, TOutput>(endpoint: string) {
  return useMutation<TOutput, Error, TInput>({
    mutationKey: [endpoint, "POST"],
    mutationFn: (data: TInput) =>
      fetchJson<TOutput>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

/**
 * PUT request
 */
export function usePutData<TInput, TOutput>(endpoint: string) {
  return useMutation<TOutput, Error, TInput>({
    mutationKey: [endpoint, "PUT"],
    mutationFn: (data: TInput) =>
      fetchJson<TOutput>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

/**
 * PATCH request
 */
export function usePatchData<TInput, TOutput>(endpoint: string) {
  return useMutation<TOutput, Error, TInput>({
    mutationKey: [endpoint, "PATCH"],
    mutationFn: (data: TInput) =>
      fetchJson<TOutput>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

/**
 * DELETE request
 */
export function useDeleteData<
  TOutput = unknown,
  TInput = { id: string | number }
>(endpoint: string) {
  return useMutation<TOutput, Error, TInput>({
    mutationKey: [endpoint, "DELETE"],
    mutationFn: (data: TInput) =>
      fetchJson<TOutput>(endpoint, {
        method: "DELETE",
        body: JSON.stringify(data),
      }),
  });
}

/**
 * DELETE Bulk request
 */
export function useDeleteBulkData<
  TOutput = unknown,
  TInput = {
    ids: string[] | number[];
  }
>(endpoint: string) {
  return useMutation<TOutput, Error, TInput>({
    mutationKey: [endpoint, "DELETE"],
    mutationFn: (data: TInput) =>
      fetchJson<TOutput>(endpoint, {
        method: "DELETE",
        body: JSON.stringify(data),
      }),
  });
}
