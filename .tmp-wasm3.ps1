$bytes = [IO.File]::ReadAllBytes('c:\www\zh-keyboard\packages\pinyin\data\rime-api.wasm')
$text = [Text.Encoding]::ASCII.GetString($bytes)
function DumpNear($needle, $span=200){
  $i=0
  while (($i=$text.IndexOf($needle,$i)) -ge 0){
    $s=[Math]::Max(0,$i-$span); $l=[Math]::Min($span*2,$text.Length-$s)
    "==== '$needle' @ $i ===="
    ($text.Substring($s,$l) -replace '[^\x20-\x7E]','.')
    $i+= $needle.Length
  }
}
foreach($k in 'set_schema','select_schema','schema_id','luna_pinyin','pinyin_simp','create_session','RimeSchema','get_schema'){
  "########## $k (count=$($text.Split($k).Count-1)) ##########"
  if(($text.Split($k).Count-1) -gt 0){ DumpNear $k 160 }
}
