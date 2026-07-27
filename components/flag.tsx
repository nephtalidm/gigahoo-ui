// A small flag image: a local asset path (e.g. "/flags/punjab.svg") or a flagcdn
// country code (e.g. "es" -> https://flagcdn.com/es.svg). Shared by the language
// switcher and the voice-agent language tabs so flags render identically.
export function Flag({ code, className }: { code: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={code.startsWith("/") ? code : `https://flagcdn.com/${code}.svg`}
      alt=""
      width={18}
      height={13}
      className={className ?? "h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"}
    />
  )
}
