import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  BOOK_FIELD_LABELS,
  PRODUCT_FIELD_LABELS,
  cn,
} from '@scan-it/lib'
import { Button } from './ui/button.tsx'
import type {
  BookEnrichSeparator,
  BookFieldId,
  ProductFieldId,
} from '@scan-it/lib'
import type {
  DeskInjectConfig,
  EnrichMode,
  EnrichUiStatus,
  InjectSuffix,
} from '../screens/desk-screen.tsx'

export type DeskOutputSettingsProps = {
  ended: boolean
  scanToClipboard: boolean
  onScanToClipboardChange: (checked: boolean) => void
  clipboardHint: string | null
  
  inject: DeskInjectConfig | undefined
  typeIntoApp: boolean
  onTypeIntoAppChange: (checked: boolean) => void
  injectSuffix: InjectSuffix
  onInjectSuffixChange: (suffix: InjectSuffix) => void
  
  enrichMode: EnrichMode
  onEnrichModeChange: (mode: EnrichMode) => void
  enrichSeparator: BookEnrichSeparator
  onEnrichSeparatorChange: (sep: BookEnrichSeparator) => void
  enrichHasMultipleColumns: boolean
  
  bookFieldColumns: Array<BookFieldId>
  bookFieldsAvailableToAdd: Array<BookFieldId>
  moveBookField: (index: number, dir: -1 | 1) => void
  removeBookField: (id: BookFieldId) => void
  addBookField: (id: BookFieldId) => void

  foodFieldColumns: Array<ProductFieldId>
  foodFieldsAvailableToAdd: Array<ProductFieldId>
  moveFoodField: (index: number, dir: -1 | 1) => void
  removeFoodField: (id: ProductFieldId) => void
  addFoodField: (id: ProductFieldId) => void

  beautyFieldColumns: Array<ProductFieldId>
  beautyFieldsAvailableToAdd: Array<ProductFieldId>
  moveBeautyField: (index: number, dir: -1 | 1) => void
  removeBeautyField: (id: ProductFieldId) => void
  addBeautyField: (id: ProductFieldId) => void

  enrichStatus: EnrichUiStatus
  
  latestScanEnriched: { line: string; parts: Array<string> } | null
}

export function DeskOutputSettings({
  ended,
  scanToClipboard,
  onScanToClipboardChange,
  clipboardHint,
  inject,
  typeIntoApp,
  onTypeIntoAppChange,
  injectSuffix,
  onInjectSuffixChange,
  enrichMode,
  onEnrichModeChange,
  enrichSeparator,
  onEnrichSeparatorChange,
  enrichHasMultipleColumns,
  bookFieldColumns,
  bookFieldsAvailableToAdd,
  moveBookField,
  removeBookField,
  addBookField,
  foodFieldColumns,
  foodFieldsAvailableToAdd,
  moveFoodField,
  removeFoodField,
  addFoodField,
  beautyFieldColumns,
  beautyFieldsAvailableToAdd,
  moveBeautyField,
  removeBeautyField,
  addBeautyField,
  enrichStatus,
  latestScanEnriched,
}: DeskOutputSettingsProps) {
  const activeFieldLabels = React.useMemo(() => {
    if (enrichMode === 'book') return bookFieldColumns.map(id => BOOK_FIELD_LABELS[id])
    if (enrichMode === 'food') return foodFieldColumns.map(id => PRODUCT_FIELD_LABELS[id])
    if (enrichMode === 'beauty') return beautyFieldColumns.map(id => PRODUCT_FIELD_LABELS[id])
    return []
  }, [enrichMode, bookFieldColumns, foodFieldColumns, beautyFieldColumns])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Where to put each scan</h3>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={scanToClipboard}
            disabled={ended}
            onChange={(e) => onScanToClipboardChange(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
          />
          <span className="text-foreground">
            <span className="font-medium">Scan to clipboard</span>
            <span className="mt-0.5 block text-muted-foreground">
              When on, each new scan copies to the clipboard. Your browser
              may ask for permission when you enable this.
            </span>
            {clipboardHint ? (
              <span className="mt-1 block text-xs text-muted-foreground">
                {clipboardHint}
              </span>
            ) : null}
          </span>
        </label>

        <label className={cn("flex cursor-pointer items-start gap-3 text-sm", !inject && "opacity-60")}>
          <input
            type="checkbox"
            checked={inject ? typeIntoApp : false}
            disabled={ended || !inject}
            onChange={(e) => onTypeIntoAppChange(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
          />
          <span className="text-foreground">
            <span className="flex items-center gap-2 font-medium">
              Type into focused app
              {!inject ? (
                <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                  Desktop only
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block text-muted-foreground">
              Sends each new scan as keystrokes to whichever window is
              focused (e.g. Excel). Click the target field first.
            </span>
          </span>
        </label>
      </div>

      {inject && typeIntoApp ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">After typing each scan</h3>
          <label className="flex flex-col gap-1 text-sm">
            <select
              value={injectSuffix}
              disabled={ended}
              onChange={(e) =>
                onInjectSuffixChange(e.target.value as InjectSuffix)
              }
              className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
            >
              <option value="none">Nothing</option>
              <option value="enter">Press Enter</option>
              <option value="tab">Press Tab</option>
            </select>
          </label>
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-4", !inject && "opacity-60")}>
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Add details from the internet
            {!inject ? (
              <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                Desktop only
              </span>
            ) : null}
          </h3>
          <p className="text-sm text-muted-foreground">
            We use the barcode to fetch name, brand, and other fields you pick. If nothing is found, you still get the scanned code.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { id: 'off', label: 'Off — barcode only', desc: '' },
            { id: 'food', label: 'Groceries & packaged food', desc: 'Data from Open Food Facts' },
            { id: 'beauty', label: 'Beauty & personal care', desc: 'Data from Open Beauty Facts' },
            { id: 'book', label: 'Books', desc: 'Data from Open Library' },
          ].map((opt) => {
            const isChecked = inject ? enrichMode === opt.id : opt.id === 'off'
            return (
              <label
                key={opt.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                  isChecked
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 hover:bg-muted/30'
                )}
              >
                <input
                  type="radio"
                  name="enrichMode"
                  value={opt.id}
                  checked={isChecked}
                  disabled={ended || !inject}
                  onChange={() => onEnrichModeChange(opt.id as EnrichMode)}
                  className="mt-0.5 size-4 shrink-0 border-border accent-primary"
                />
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">{opt.label}</span>
                  {opt.desc ? (
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {opt.desc}
                    </span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </div>

        {enrichMode !== 'off' ? (
            <div className="mt-2 space-y-5 rounded-lg border border-border/60 bg-card/40 p-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">
                  Separate cells with
                </span>
                <select
                  value={enrichSeparator === '\t' ? 'tab' : 'comma'}
                  disabled={ended}
                  onChange={(e) =>
                    onEnrichSeparatorChange(
                      e.target.value === 'comma' ? ',' : '\t',
                    )
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                >
                  <option value="tab">Tabs — best for Excel</option>
                  <option value="comma">Commas — like CSV</option>
                </select>
              </label>

              {enrichSeparator === '\t' && enrichHasMultipleColumns ? (
                <p className="text-xs text-amber-700 dark:text-amber-500/90">
                  With multiple columns, set &quot;After typing each scan&quot; to
                  Nothing or Enter—not Tab—or Excel will move past the
                  last cell.
                </p>
              ) : null}

              <div className="space-y-3">
                <span className="text-sm font-medium text-foreground">
                  Information to include (order = left to right in Excel)
                </span>
                
                {enrichMode === 'book' ? (
                  <ColumnEditor
                    ended={ended}
                    columns={bookFieldColumns}
                    available={bookFieldsAvailableToAdd}
                    labels={BOOK_FIELD_LABELS}
                    onMove={moveBookField}
                    onRemove={removeBookField}
                    onAdd={addBookField}
                  />
                ) : enrichMode === 'food' ? (
                  <ColumnEditor
                    ended={ended}
                    columns={foodFieldColumns}
                    available={foodFieldsAvailableToAdd}
                    labels={PRODUCT_FIELD_LABELS}
                    onMove={moveFoodField}
                    onRemove={removeFoodField}
                    onAdd={addFoodField}
                  />
                ) : (
                  <ColumnEditor
                    ended={ended}
                    columns={beautyFieldColumns}
                    available={beautyFieldsAvailableToAdd}
                    labels={PRODUCT_FIELD_LABELS}
                    onMove={moveBeautyField}
                    onRemove={removeBeautyField}
                    onAdd={addBeautyField}
                  />
                )}
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4">
                <span className="text-sm font-medium text-foreground">
                  Preview (latest scan)
                </span>
                
                {enrichStatus === 'loading' ? (
                  <p className="text-xs text-muted-foreground">Looking up...</p>
                ) : enrichStatus === 'error' ? (
                  <p className="text-xs text-destructive">Lookup failed; using scanned code only.</p>
                ) : !latestScanEnriched ? (
                  <p className="text-xs text-muted-foreground">Scan a barcode to see a preview.</p>
                ) : latestScanEnriched.parts.length !== activeFieldLabels.length ? (
                  <p className="text-xs text-muted-foreground">Scan again to update the preview.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-border/60 bg-background">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                          {activeFieldLabels.map((label, i) => (
                            <th key={i} className="whitespace-nowrap px-3 py-2 font-medium text-muted-foreground">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {latestScanEnriched.parts.map((part, i) => (
                            <td key={i} className="whitespace-nowrap px-3 py-2 text-foreground">
                              {part || <span className="text-muted-foreground/50 italic">empty</span>}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                
                {enrichStatus === 'not_found' ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Not found in database (empty fields where unknown).
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
    </div>
  )
}

function ColumnEditor<T extends string>({
  ended,
  columns,
  available,
  labels,
  onMove,
  onRemove,
  onAdd,
}: {
  ended: boolean
  columns: Array<T>
  available: Array<T>
  labels: Record<T, string>
  onMove: (index: number, dir: -1 | 1) => void
  onRemove: (id: T) => void
  onAdd: (id: T) => void
}) {
  return (
    <>
      <ul className="space-y-1.5">
        {columns.map((id, i) => (
          <li
            key={id}
            className="flex items-center gap-1 rounded-md border border-border/50 bg-background/40 px-2 py-1.5"
          >
            <span className="min-w-0 flex-1 text-xs text-foreground">
              {labels[id]}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={ended || i === 0}
              className="size-8 shrink-0"
              aria-label="Move column up"
              onClick={() => onMove(i, -1)}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={ended || i === columns.length - 1}
              className="size-8 shrink-0"
              aria-label="Move column down"
              onClick={() => onMove(i, 1)}
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={ended || columns.length <= 1}
              className="h-8 shrink-0 px-2 text-xs text-muted-foreground"
              onClick={() => onRemove(id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      {available.length > 0 ? (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground">Add column</span>
          <div className="flex flex-wrap gap-1.5">
            {available.map((id) => (
              <Button
                key={id}
                type="button"
                variant="outline"
                size="sm"
                disabled={ended}
                className="h-7 text-xs"
                onClick={() => onAdd(id)}
              >
                {labels[id]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
