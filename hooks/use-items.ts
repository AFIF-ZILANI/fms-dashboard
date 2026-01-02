import { useQuery } from "@tanstack/react-query";

export function useItems(page: number) {
    return useQuery({
        queryKey: ["items", page],
        queryFn: async () => {
            const res = await fetch(`/api/get/stock/items?page=${page}&limit=10`);
            if (!res.ok) throw new Error("Failed to fetch items");
            return res.json();
        },
        placeholderData: (previousData) => previousData,
    });
}
