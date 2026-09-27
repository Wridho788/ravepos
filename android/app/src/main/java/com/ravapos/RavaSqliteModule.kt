package com.ravapos

import android.database.sqlite.SQLiteDatabase
import android.app.Activity
import android.content.Intent
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import org.json.JSONObject
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener

class RavaSqliteModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context), ActivityEventListener {
  private val db: SQLiteDatabase = context.openOrCreateDatabase("ravapos.db", 0, null)
  private var filePromise: Promise? = null
  private var fileMode = ""

  init { context.addActivityEventListener(this) }

  override fun getName() = "RavaSqlite"

  @ReactMethod
  fun execute(sql: String, params: ReadableArray, promise: Promise) {
    try { promise.resolve(run(sql, params)) } catch (error: Exception) { promise.reject("SQLITE_ERROR", error) }
  }

  @ReactMethod
  fun executeBatch(statements: ReadableArray, promise: Promise) {
    try {
      db.beginTransaction()
      val output = Arguments.createArray()
      for (index in 0 until statements.size()) {
        val item = statements.getMap(index) ?: continue
        output.pushMap(run(item.getString("sql") ?: "", item.getArray("params") ?: Arguments.createArray()))
      }
      db.setTransactionSuccessful()
      promise.resolve(output)
    } catch (error: Exception) {
      promise.reject("SQLITE_TRANSACTION_ERROR", error)
    } finally { if (db.inTransaction()) db.endTransaction() }
  }

  @ReactMethod
  fun saveFile(contents: String, filename: String, mimeType: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || filePromise != null) { promise.reject("FILE_PICKER_BUSY", "File picker is unavailable"); return }
    filePromise = promise
    fileMode = "save"
    val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
      addCategory(Intent.CATEGORY_OPENABLE)
      type = mimeType
      putExtra(Intent.EXTRA_TITLE, filename)
    }
    savedContents = contents
    try { activity.startActivityForResult(intent, 7101) }
    catch (error: Exception) { filePromise = null; fileMode = ""; savedContents = ""; promise.reject("FILE_PICKER_UNAVAILABLE", error) }
  }

  @ReactMethod
  fun saveExcel(contents: String, filename: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || filePromise != null) { promise.reject("FILE_PICKER_BUSY", "File picker is unavailable"); return }
    filePromise = promise
    fileMode = "excel"
    savedContents = contents
    val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
      addCategory(Intent.CATEGORY_OPENABLE)
      type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      putExtra(Intent.EXTRA_TITLE, filename)
    }
    try { activity.startActivityForResult(intent, 7103) }
    catch (error: Exception) { filePromise = null; fileMode = ""; savedContents = ""; promise.reject("FILE_PICKER_UNAVAILABLE", error) }
  }

  private var savedContents = ""

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != 7101 && requestCode != 7103) return
    val promise = filePromise ?: return
    filePromise = null
    try {
      if (resultCode != Activity.RESULT_OK || data?.data == null) { promise.reject("FILE_CANCELLED", "File operation cancelled"); return }
      val uri = data.data!!
      if (requestCode == 7101 && fileMode == "save") {
        val output = reactApplicationContext.contentResolver.openOutputStream(uri) ?: throw IllegalStateException("Cannot open destination")
        output.bufferedWriter(Charsets.UTF_8).use { it.write(savedContents) }
        promise.resolve(uri.toString())
      } else if (requestCode == 7103 && fileMode == "excel") {
        val output = reactApplicationContext.contentResolver.openOutputStream(uri) ?: throw IllegalStateException("Cannot open destination")
        output.use { writeWorkbook(it) }
        promise.resolve(uri.toString())
      } else {
        promise.reject("FILE_OPERATION_FAILED", "File operation is unavailable")
      }
    } catch (error: Exception) { promise.reject("FILE_OPERATION_FAILED", error) }
    finally { fileMode = ""; savedContents = "" }
  }

  private fun writeWorkbook(output: java.io.OutputStream) {
    val data = JSONObject(savedContents)
    val headers = data.getJSONArray("headers")
    val rows = data.getJSONArray("rows")
    val worksheet = StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>")
    fun columnName(number: Int): String {
      var value = number
      var result = ""
      while (value > 0) { val remainder = (value - 1) % 26; result = ('A' + remainder) + result; value = (value - 1) / 26 }
      return result
    }
    fun xml(value: String): String = value
      .replace(Regex("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]"), "")
      .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
      .replace("\"", "&quot;").replace("'", "&apos;")
    fun addRow(rowNumber: Int, values: List<Any?>) {
      worksheet.append("<row r=\"").append(rowNumber).append("\">")
      values.forEachIndexed { index, value ->
        val ref = columnName(index + 1) + rowNumber
        if (value is Number && value.toDouble().isFinite()) {
          worksheet.append("<c r=\"").append(ref).append("\"><v>").append(value.toString()).append("</v></c>")
        } else {
          worksheet.append("<c r=\"").append(ref).append("\" t=\"inlineStr\"><is><t xml:space=\"preserve\">")
            .append(xml(value?.toString() ?: "")).append("</t></is></c>")
        }
      }
      worksheet.append("</row>")
    }
    addRow(1, (0 until headers.length()).map { headers.optString(it) })
    for (index in 0 until rows.length()) {
      val row = rows.getJSONArray(index)
      addRow(index + 2, (0 until row.length()).map { row.opt(it) })
    }
    worksheet.append("</sheetData></worksheet>")

    ZipOutputStream(output).use { zip ->
      fun entry(path: String, content: String) {
        zip.putNextEntry(ZipEntry(path)); zip.write(content.toByteArray(Charsets.UTF_8)); zip.closeEntry()
      }
      entry("[Content_Types].xml", "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/><Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/></Types>")
      entry("_rels/.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/></Relationships>")
      entry("xl/workbook.xml", "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><sheets><sheet name=\"Data\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>")
      entry("xl/_rels/workbook.xml.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/></Relationships>")
      entry("xl/worksheets/sheet1.xml", worksheet.toString())
    }
  }

  override fun onNewIntent(intent: Intent) {}

  private fun run(sql: String, params: ReadableArray): com.facebook.react.bridge.WritableMap {
    val result = Arguments.createMap()
    val trimmed = sql.trimStart().uppercase()
    if (trimmed.startsWith("PRAGMA") && trimmed.contains("=")) {
      db.execSQL(sql)
      result.putArray("rows", Arguments.createArray())
    } else if (trimmed.startsWith("SELECT") || trimmed.startsWith("PRAGMA") || trimmed.startsWith("WITH")) {
      val args = Array(params.size()) { index -> if (params.isNull(index)) null else params.getDynamic(index).asString() }
      db.rawQuery(sql, args).use { cursor ->
        val rows = Arguments.createArray()
        while (cursor.moveToNext()) {
          val row = Arguments.createMap()
          for (column in 0 until cursor.columnCount) when (cursor.getType(column)) {
            android.database.Cursor.FIELD_TYPE_INTEGER -> row.putDouble(cursor.getColumnName(column), cursor.getLong(column).toDouble())
            android.database.Cursor.FIELD_TYPE_FLOAT -> row.putDouble(cursor.getColumnName(column), cursor.getDouble(column))
            android.database.Cursor.FIELD_TYPE_BLOB -> row.putString(cursor.getColumnName(column), android.util.Base64.encodeToString(cursor.getBlob(column), android.util.Base64.NO_WRAP))
            android.database.Cursor.FIELD_TYPE_NULL -> row.putNull(cursor.getColumnName(column))
            else -> row.putString(cursor.getColumnName(column), cursor.getString(column))
          }
          rows.pushMap(row)
        }
        result.putArray("rows", rows)
      }
    } else {
      val statement = db.compileStatement(sql)
      for (index in 0 until params.size()) when {
        params.isNull(index) -> statement.bindNull(index + 1)
        params.getType(index) == com.facebook.react.bridge.ReadableType.Number -> statement.bindDouble(index + 1, params.getDouble(index))
        params.getType(index) == com.facebook.react.bridge.ReadableType.Boolean -> statement.bindLong(index + 1, if (params.getBoolean(index)) 1 else 0)
        else -> statement.bindString(index + 1, params.getString(index) ?: "")
      }
      val changes = when {
        trimmed.startsWith("INSERT") -> { statement.executeInsert(); 1 }
        trimmed.startsWith("UPDATE") || trimmed.startsWith("DELETE") -> statement.executeUpdateDelete()
        else -> { statement.execute(); 0 }
      }
      val insertId = if (trimmed.startsWith("INSERT")) db.compileStatement("SELECT last_insert_rowid()").simpleQueryForLong() else -1L
      result.putDouble("changes", changes.toDouble())
      result.putDouble("insertId", insertId.toDouble())
    }
    return result
  }
}
