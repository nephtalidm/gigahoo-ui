// Image-based flag (flagcdn) — renders consistently across OSes, unlike emoji
// flags which show as letters (e.g. "CA") on Windows. Same flag used by the
// country/language switchers across the site.
export function CountryFlag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      width={18}
      height={13}
      className="h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
    />
  )
}
