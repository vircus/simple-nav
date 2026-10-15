'use client'

import {
  Base64Tool,
  UrlEncodeTool,
  JsonTool,
  TimestampTool,
  BaseConvertTool,
  HashTool,
} from './codec'
import {
  WordCountTool,
  CaseConvertTool,
  RegexTool,
  TextDiffTool,
  MarkdownTool,
} from './text'
import {
  QrCodeTool,
  PasswordTool,
  UuidTool,
  RandomNumberTool,
  LoremTool,
} from './generator'
import { IpLookupTool, DnsLookupTool, UserAgentTool, HttpStatusTool } from './network'
import {
  JwtTool,
  CsvJsonTool,
  JsonYamlTool,
  UnicodeTool,
  FileSizeTool,
  CronTool,
  HtmlEscapeTool,
  UrlParamsTool,
  CookieTool,
  XmlFormatTool,
  SqlFormatTool,
  CssGradientTool,
  MysqlGoStructTool,
  MockDataTool,
  HmacTool,
} from './devops-new'
import { HttpRequestTool, ShortLinkTool } from './devops-api'
import {
  TextDedupeTool,
  TextSortTool,
  TrimSpaceTool,
  WordFreqTool,
  TextEncryptTool,
  RichTextTool,
} from './text-new'
import {
  UnitConvertTool,
  CalculatorTool,
  MorseTool,
  AsciiTableTool,
  DateCalcTool,
  AgeCalcTool,
  BmiTool,
  LoanTool,
  TaxTool,
  PomodoroTool,
  CountdownTool,
} from './edu'
import {
  ImageBase64Tool,
  ImageCompressTool,
  ImageConvertTool,
  ImageSplitTool,
  ImageWatermarkTool,
  ImagePaletteTool,
  TextToImageTool,
  FaviconTool,
  DoodleTool,
} from './image'
import {
  DecideTool,
  CoinTool,
  DiceTool,
  RandomNameTool,
  WheelTool,
  RollCallTool,
} from './random'
import { ChartBarTool, ChartLineTool, ChartPieTool, ChartScatterTool } from './chart'
import { NumberToCnTool, ColorPickerTool, DanmakuTool } from './misc'
import type { PublicNetworkConfig } from '@/lib/types'

export function ToolRenderer({
  slug,
  network,
}: {
  slug: string
  network?: { ipLookup: PublicNetworkConfig; dnsLookup: PublicNetworkConfig }
}) {
  switch (slug) {
    /* 开发运维 */
    case 'base64':
      return <Base64Tool />
    case 'url-encode':
      return <UrlEncodeTool />
    case 'json-format':
      return <JsonTool />
    case 'json-yaml':
      return <JsonYamlTool />
    case 'csv-json':
      return <CsvJsonTool />
    case 'timestamp':
      return <TimestampTool />
    case 'hash':
      return <HashTool />
    case 'hmac':
      return <HmacTool />
    case 'jwt':
      return <JwtTool />
    case 'base-convert':
      return <BaseConvertTool />
    case 'uuid':
      return <UuidTool />
    case 'password':
      return <PasswordTool />
    case 'naming-convert':
      return <CaseConvertTool />
    case 'unicode':
      return <UnicodeTool />
    case 'file-size':
      return <FileSizeTool />
    case 'cron':
      return <CronTool />
    case 'html-escape':
      return <HtmlEscapeTool />
    case 'url-params':
      return <UrlParamsTool />
    case 'cookie':
      return <CookieTool />
    case 'xml-format':
      return <XmlFormatTool />
    case 'sql-format':
      return <SqlFormatTool />
    case 'css-gradient':
      return <CssGradientTool />
    case 'mysql-go-struct':
      return <MysqlGoStructTool />
    case 'mock-data':
      return <MockDataTool />
    case 'http-request':
      return <HttpRequestTool />
    case 'short-link':
      return <ShortLinkTool />
    case 'http-status':
      return <HttpStatusTool />
    case 'user-agent':
      return <UserAgentTool />
    case 'ip-lookup':
      return <IpLookupTool config={network?.ipLookup} />
    case 'dns-lookup':
      return <DnsLookupTool config={network?.dnsLookup} />
    case 'qrcode':
      return <QrCodeTool />

    /* 文本处理 */
    case 'markdown':
      return <MarkdownTool />
    case 'word-count':
      return <WordCountTool />
    case 'word-freq':
      return <WordFreqTool />
    case 'text-dedupe':
      return <TextDedupeTool />
    case 'text-sort':
      return <TextSortTool />
    case 'trim-space':
      return <TrimSpaceTool />
    case 'text-diff':
      return <TextDiffTool />
    case 'text-encrypt':
      return <TextEncryptTool />
    case 'regex-tester':
      return <RegexTool />
    case 'rich-text':
      return <RichTextTool />
    case 'lorem':
      return <LoremTool />

    /* 教育学术 */
    case 'unit-convert':
      return <UnitConvertTool />
    case 'calculator':
      return <CalculatorTool />
    case 'morse':
      return <MorseTool />
    case 'ascii-table':
      return <AsciiTableTool />
    case 'date-calc':
      return <DateCalcTool />
    case 'age-calc':
      return <AgeCalcTool />
    case 'bmi':
      return <BmiTool />
    case 'loan':
      return <LoanTool />
    case 'tax':
      return <TaxTool />
    case 'pomodoro':
      return <PomodoroTool />
    case 'countdown':
      return <CountdownTool />

    /* 图片处理 */
    case 'image-base64':
      return <ImageBase64Tool />
    case 'image-compress':
      return <ImageCompressTool />
    case 'image-convert':
      return <ImageConvertTool />
    case 'image-split':
      return <ImageSplitTool />
    case 'image-watermark':
      return <ImageWatermarkTool />
    case 'image-palette':
      return <ImagePaletteTool />
    case 'text-to-image':
      return <TextToImageTool />
    case 'favicon':
      return <FaviconTool />
    case 'doodle':
      return <DoodleTool />

    /* 数据图表 */
    case 'chart-bar':
      return <ChartBarTool />
    case 'chart-line':
      return <ChartLineTool />
    case 'chart-pie':
      return <ChartPieTool />
    case 'chart-scatter':
      return <ChartScatterTool />

    /* 选择随机 */
    case 'random-number':
      return <RandomNumberTool />
    case 'decide':
      return <DecideTool />
    case 'coin':
      return <CoinTool />
    case 'dice':
      return <DiceTool />
    case 'random-name':
      return <RandomNameTool />
    case 'wheel':
      return <WheelTool />
    case 'roll-call':
      return <RollCallTool />

    /* 其他工具 */
    case 'number-to-cn':
      return <NumberToCnTool />
    case 'color-picker':
      return <ColorPickerTool />
    case 'danmaku':
      return <DanmakuTool />

    default:
      return null
  }
}
