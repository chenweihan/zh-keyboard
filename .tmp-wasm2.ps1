$bytes = [IO.File]::ReadAllBytes('c:\www\zh-keyboard\packages\pinyin\data\rime-api.wasm')
$text = [Text.Encoding]::ASCII.GetString($bytes)
$idx = 0
while (($idx = $text.IndexOf('luna_pinyin', $idx)) -ge 0) {
  $start = [Math]::Max(0, $idx - 240)
  $len = [Math]::Min(480, $text.Length - $start)
  $seg = $text.Substring($start, $len) -replace '[^\x20-\x7E]', '.'
  "==== offset $idx ===="
  $seg
  $idx += 11
}
"-- schema_list context --"
$idx = $text.IndexOf('schema_list')
while ($idx -ge 0) {
  $start = [Math]::Max(0, $idx - 120); $len = [Math]::Min(360, $text.Length-$start)
  ($text.Substring($start,$len) -replace '[^\x20-\x7E]','.')
  $idx = $text.IndexOf('schema_list', $idx+11)
}
