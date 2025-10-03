const BASE_URL = import.meta.env.VITE_API_BASE_URL

export function mapProductImages(imgs,service) {
  if (!imgs) return []
  return imgs.map((url, index) => ({
    name: `image-${index}`,
    url: BASE_URL + service + url
  }))
}