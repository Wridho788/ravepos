import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {MaterialDesignIcons} from '@react-native-vector-icons/material-design-icons/static';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {addExpense, addReceivablePayment, adjustStock, CartLine, checkout, Customer, exportCsv, exportExcel, ExportKind, Expense, getReport, getSetting, initializeDatabase, listCustomers, listExpenses, listProducts, listReceivables, Product, resetBusinessData, saveCustomer, saveProduct, seedDemoData, setSetting} from './src/data/database';

type Page = 'pos'|'products'|'customers'|'expenses'|'reports'|'data';
const green = '#176044';
const ink = '#1C2922';
const muted = '#758078';
const idr = (amount: number) => `Rp${Math.round(amount).toLocaleString('id-ID')}`;

function App() {
  return <SafeAreaProvider><StatusBar barStyle="dark-content"/><RavaApp/></SafeAreaProvider>;
}

function RavaApp() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [store, setStore] = useState('');
  const [setupDone, setSetupDone] = useState(false);
  const [page, setPage] = useState<Page>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivables, setReceivables] = useState<Record<string, string|number|null>[]>([]);
  const [report, setReport] = useState({count: 0, sales: 0, expenses: 0, best: [] as Record<string, string|number|null>[], methods: [] as Record<string, string|number|null>[]});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('Tunai');
  const [cash, setCash] = useState('');
  const [onCredit, setOnCredit] = useState(false);
  const [customerId, setCustomerId] = useState<string|null>(null);
  const [notice, setNotice] = useState('');
  const pulse = useRef(new Animated.Value(0.94)).current;

  const reload = useCallback(async () => {
    const [ps, cs, es, rs, summary] = await Promise.all([listProducts(), listCustomers(), listExpenses(), listReceivables(), getReport()]);
    setProducts(ps); setCustomers(cs); setExpenses(es); setReceivables(rs); setReport(summary);
  }, []);
  const openApp = useCallback(async () => {
    setReady(false); setError('');
    try { await initializeDatabase(); setStore(await getSetting('storeName')); setSetupDone((await getSetting('setupComplete')) === '1'); await reload(); }
    catch { setError('open'); }
    finally { setReady(true); }
  }, [reload]);
  useEffect(() => { void openApp(); }, [openApp]);
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, {toValue: 1.04, duration: 850, useNativeDriver: true}),
      Animated.timing(pulse, {toValue: 0.94, duration: 850, useNativeDriver: true}),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const total = useMemo(() => cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [cart]);
  const visible = products.filter(item => `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase()));
  const run = async (task: () => Promise<unknown>, done?: string, failed?: string) => {
    try { await task(); await reload(); setNotice(done ?? 'Tersimpan.'); }
    catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (message.toLowerCase().includes('file operation cancelled')) return;
      Alert.alert('Tidak dapat melanjutkan', failed ?? (message || 'Terjadi kesalahan.'));
    }
  };
  const finishSetup = async (withDemo = false) => {
    if (!store.trim()) return Alert.alert('Nama toko diperlukan');
    await setSetting('storeName', store.trim()); await setSetting('setupComplete', '1');
    if (withDemo) await seedDemoData();
    setSetupDone(true); await reload();
  };

  if (!ready) return <SafeAreaView style={s.safe}><View style={s.center}><Animated.View style={{transform:[{scale:pulse}]}}><Image source={require('./assets/brand/ravapos-icon.png')} resizeMode="contain" style={s.loadingIcon}/></Animated.View><ActivityIndicator color={green}/><Text style={s.loadingTitle}>RavaPOS sedang menyiapkan toko Anda</Text><Text style={s.mutedText}>Mohon tunggu sebentar.</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={s.safe}><View style={s.center}><Animated.View style={{transform:[{scale:pulse}]}}><Image source={require('./assets/brand/ravapos-icon.png')} resizeMode="contain" style={s.loadingIcon}/></Animated.View><Text style={s.title}>Toko belum dapat dibuka</Text><Text style={s.mutedText}>Kami belum berhasil menyiapkan RavaPOS. Silakan coba lagi.</Text><Button title="Coba lagi" onPress={()=>void openApp()}/></View></SafeAreaView>;
  if (!setupDone) return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.setup} behavior={Platform.OS==='ios'?'padding':undefined}>
    <Image source={require('./assets/brand/ravapos-logo.png')} resizeMode="contain" style={s.setupLogo}/><Text style={s.eyebrow}>KASIR OFFLINE UNTUK USAHA KECIL</Text><Text style={s.hero}>Mulai dari toko kamu.</Text><Text style={s.mutedText}>Produk, transaksi, dan laporan tersimpan di perangkat ini. Tidak perlu internet.</Text>
    <Text style={s.label}>NAMA TOKO</Text><Field value={store} onChangeText={setStore} placeholder="Contoh: Warung Bu Sari"/><Button title="Siapkan toko kosong" onPress={()=>run(()=>finishSetup(false))}/><Button title="Coba dengan data contoh" secondary onPress={()=>run(()=>finishSetup(true))}/><Text style={s.small}>Data contoh bisa dihapus dari menu Data. Ekspor data secara berkala agar salinannya tetap aman.</Text>
  </KeyboardAvoidingView></SafeAreaView>;

  const changeCart = (product: Product, delta: number) => setCart(old => {
    const current = old.find(line => line.product.id === product.id);
    if (!current && delta > 0) return [...old, {product, quantity: delta}];
    return old.map(line => line.product.id===product.id ? {...line, quantity: line.quantity+delta} : line).filter(line=>line.quantity>0);
  });
  const completeSale = async () => {
    const paid = Number(cash.replace(/\D/g,'')) || 0;
    const result = await checkout(cart, method, paid, customerId, onCredit);
    setCart([]); setCash(''); setOnCredit(false); setCustomerId(null); setNotice('Transaksi berhasil disimpan.'); await reload();
    Alert.alert('Transaksi tersimpan', `${result.receipt}\nTotal ${idr(result.total)}${onCredit?' · dicatat sebagai piutang':`\nKembalian ${idr(result.change)}`}`);
  };

  return <SafeAreaView style={s.safe}>
    <View style={s.top}><Image source={require('./assets/brand/ravapos-logo.png')} resizeMode="contain" style={s.logo}/><View style={s.topRight}><Text style={s.storeName}>{store}</Text><Text style={s.offline}>●  DATA LOKAL · OFFLINE</Text></View></View>
    {notice ? <Text style={s.notice}>{notice}</Text> : null}
    <View style={s.body}>
      {page==='pos' && <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Kasir</Text><Text style={s.mutedText}>Pilih produk untuk membuat transaksi.</Text><Field value={query} onChangeText={setQuery} placeholder="Cari nama atau SKU"/>
        {visible.map(item=><Pressable key={item.id} style={s.row} onPress={()=>changeCart(item,1)}><View style={s.flex}><Text style={s.rowTitle}>{item.name}</Text><Text style={s.small}>{item.category} · Stok {item.stock} {item.unit}</Text></View><View style={s.right}><Text style={s.price}>{idr(item.price)}</Text><Text style={s.add}>+ Tambah</Text></View></Pressable>)}
        <Text style={s.section}>KERANJANG · {cart.reduce((n,l)=>n+l.quantity,0)} item</Text>
        {cart.map(line=><View key={line.product.id} style={s.cartRow}><View style={s.flex}><Text style={s.rowTitle}>{line.product.name}</Text><Text style={s.small}>{idr(line.product.price)} × {line.quantity}</Text></View><View style={s.qty}><Pressable onPress={()=>changeCart(line.product,-1)}><Text style={s.qtyBtn}>−</Text></Pressable><Text style={s.rowTitle}>{line.quantity}</Text><Pressable onPress={()=>changeCart(line.product,1)}><Text style={s.qtyBtn}>+</Text></Pressable></View></View>)}
        <View style={s.total}><Text style={s.rowTitle}>Total</Text><Text style={s.totalValue}>{idr(total)}</Text></View>
        {cart.length>0 && <>
          <Text style={s.section}>PEMBAYARAN</Text>
          <View style={s.choices}>{['Tunai','Transfer','QRIS manual'].map(item=><Pill key={item} title={item} active={method===item} onPress={()=>setMethod(item)}/>)}</View>
          {method==='Tunai' && !onCredit && <Field value={cash} onChangeText={v=>setCash(v.replace(/\D/g,''))} keyboardType="numeric" placeholder="Uang diterima (Rp)"/>}
          <View style={s.choices}><Pill title={onCredit?'✓ Catat sebagai piutang':'Catat sebagai piutang'} active={onCredit} onPress={()=>setOnCredit(v=>!v)}/></View>
          {onCredit && <View style={s.card}>{customers.length===0?<Text style={s.small}>Tambahkan pelanggan di menu Pelanggan.</Text>:customers.map(c=><Pill key={c.id} title={c.name} active={customerId===c.id} onPress={()=>setCustomerId(c.id)}/>)}</View>}
          <Button title={onCredit?'Simpan transaksi piutang':`Selesaikan · ${idr(total)}`} onPress={()=>run(completeSale)}/>
        </>}
      </ScrollView>}
      {page==='products' && <ProductsPage products={products} onSave={value=>run(()=>saveProduct(value),'Produk tersimpan.')} onAdjust={(id,delta,reason)=>run(()=>adjustStock(id,delta,reason),'Mutasi stok dicatat.')}/>}
      {page==='customers' && <CustomersPage customers={customers} receivables={receivables} onSave={(name,phone)=>run(()=>saveCustomer(name,phone),'Pelanggan ditambahkan.')} onPay={(row,amount)=>run(()=>addReceivablePayment(String(row.id),amount),'Pembayaran piutang dicatat.')}/>}
      {page==='expenses' && <ExpensesPage expenses={expenses} onSave={(category,amount,note)=>run(()=>addExpense(category,amount,note),'Pengeluaran dicatat.')}/>}
      {page==='reports' && <ReportsPage report={report} expenses={expenses}/>}
      {page==='data' && <DataPage onExport={(kind,format)=>run(()=>format==='csv'?exportCsv(kind):exportExcel(kind),`File ${formatForMessage(format)} berhasil disiapkan.`,'File belum berhasil disimpan. Silakan coba lagi.')} onReset={()=>Alert.alert('Hapus seluruh data lokal?','Produk, transaksi, pelanggan, piutang, dan pengeluaran akan dihapus.',[{text:'Batal',style:'cancel'},{text:'Lanjut',style:'destructive',onPress:()=>Alert.alert('Konfirmasi terakhir','Tindakan ini tidak dapat dibatalkan. Pastikan data penting sudah diekspor.',[{text:'Batal',style:'cancel'},{text:'Hapus data',style:'destructive',onPress:()=>run(resetBusinessData,'Data usaha telah dihapus.') }])}])}/>}
    </View>
    <View style={s.tabs}>{([['pos','Kasir','cash-register'],['products','Produk','package-variant-closed'],['customers','Pelanggan','account-group-outline'],['expenses','Biaya','cash-minus'],['reports','Laporan','chart-box-outline'],['data','Data','database-export-outline']] as [Page,string,'cash-register'|'package-variant-closed'|'account-group-outline'|'cash-minus'|'chart-box-outline'|'database-export-outline'][]).map(([key,label,icon])=><Pressable key={key} accessibilityRole="tab" accessibilityState={{selected:page===key}} style={s.tab} onPress={()=>{setPage(key);setNotice('');}}><MaterialDesignIcons name={icon} size={22} color={page===key?green:muted} style={s.tabIcon}/><Text style={[s.tabText,page===key&&s.tabActive]}>{label}</Text></Pressable>)}</View>
  </SafeAreaView>;
}

function ProductsPage({products,onSave,onAdjust}:{products:Product[];onSave:(value:Omit<Product,'id'|'active'> & {id?:string})=>void;onAdjust:(id:string,delta:number,reason:string)=>void}) {
  const [expanded,setExpanded]=useState(false);const [editing,setEditing]=useState<Product|null>(null); const [name,setName]=useState('');const [category,setCategory]=useState('Umum');const [price,setPrice]=useState('');const [cost,setCost]=useState('');const [stock,setStock]=useState('');const [threshold,setThreshold]=useState('');const [sku,setSku]=useState('');const [adjusting,setAdjusting]=useState<string|null>(null);const [delta,setDelta]=useState('');const [reason,setReason]=useState('');
  const submit=()=>{if(!name.trim()||!Number(price)||Number(stock)<0)return Alert.alert('Periksa produk','Nama, harga, dan stok harus diisi dengan benar.');onSave({id:editing?.id,name:name.trim(),category,sku,price:Number(price),cost:Number(cost)||0,stock:Number(stock)||0,lowStock:Number(threshold)||0,unit:editing?.unit??'pcs'});setName('');setPrice('');setCost('');setStock('');setSku('');setEditing(null);setExpanded(false);};
  const startEdit=(p:Product)=>{setEditing(p);setExpanded(true);setName(p.name);setCategory(p.category);setSku(p.sku);setPrice(String(p.price));setCost(String(p.cost));setStock(String(p.stock));setThreshold(String(p.lowStock));};
  return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>Produk & stok</Text><Text style={s.mutedText}>Harga dan stok tersimpan lokal. Stok berkurang atomik setelah checkout.</Text><Button title={expanded?'Tutup form':'+ Tambah produk'} onPress={()=>{setEditing(null);setExpanded(v=>!v);}}/>{expanded&&<View style={s.card}><Field value={name} onChangeText={setName} placeholder="Nama produk"/><Field value={category} onChangeText={setCategory} placeholder="Kategori"/><Field value={sku} onChangeText={setSku} placeholder="SKU (opsional)"/><Field value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Harga jual (Rp)"/><Field value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="Harga modal (Rp)"/><Field value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Stok awal"/><Field value={threshold} onChangeText={setThreshold} keyboardType="numeric" placeholder="Batas stok minimum"/><Button title={editing?'Simpan perubahan':'Simpan produk'} onPress={submit}/></View>}{products.map(p=><View key={p.id} style={s.card}><View style={s.row}><View style={s.flex}><Text style={s.rowTitle}>{p.name}</Text><Text style={s.small}>{p.category} · {p.sku||'Tanpa SKU'}</Text></View><View style={s.right}><Text style={s.price}>{idr(p.price)}</Text><Text style={[s.small,p.stock<=p.lowStock&&s.red]}>Stok {p.stock} {p.unit}{p.stock<=p.lowStock?' · Rendah':''}</Text></View></View><View style={s.choices}><Pill title="Ubah produk" active={false} onPress={()=>startEdit(p)}/><Pill title="Penyesuaian stok" active={adjusting===p.id} onPress={()=>{setAdjusting(adjusting===p.id?null:p.id);setDelta('');setReason('');}}/></View>{adjusting===p.id&&<><Field value={delta} onChangeText={setDelta} keyboardType="numbers-and-punctuation" placeholder="Mutasi stok · contoh 5 atau -2"/><Field value={reason} onChangeText={setReason} placeholder="Alasan penyesuaian"/><Button title="Simpan mutasi stok" onPress={()=>{const amount=Number(delta);if(!Number.isInteger(amount)||!amount||!reason.trim())return Alert.alert('Periksa mutasi','Isi jumlah bilangan bulat bukan nol dan alasan.');onAdjust(p.id,amount,reason);setAdjusting(null);}}/></>}</View>)}</ScrollView>;
}

function CustomersPage({customers,receivables,onSave,onPay}:{customers:Customer[];receivables:Record<string,string|number|null>[];onSave:(name:string,phone:string)=>void;onPay:(row:Record<string,string|number|null>,amount:number)=>void}) {
  const [name,setName]=useState('');const [phone,setPhone]=useState('');const [payments,setPayments]=useState<Record<string,string>>({});
  return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>Pelanggan & piutang</Text><View style={s.card}><Field value={name} onChangeText={setName} placeholder="Nama pelanggan"/><Field value={phone} onChangeText={setPhone} placeholder="Nomor telepon (opsional)" keyboardType="phone-pad"/><Button title="Simpan pelanggan" onPress={()=>{if(!name.trim())return Alert.alert('Nama diperlukan');onSave(name,phone);setName('');setPhone('');}}/></View><Text style={s.section}>SALDO PIUTANG</Text>{receivables.length===0&&<Text style={s.mutedText}>Belum ada piutang aktif.</Text>}{receivables.map(row=>{const balance=Number(row.originalAmount)-Number(row.paidAmount);return <View key={String(row.id)} style={s.card}><Text style={s.rowTitle}>{String(row.customerName??'Pelanggan')} · {String(row.receiptNumber)}</Text><Text style={s.small}>Sisa {idr(balance)}</Text><Field value={payments[String(row.id)]??''} onChangeText={value=>setPayments(current=>({...current,[String(row.id)]:value.replace(/\D/g,'')}))} keyboardType="numeric" placeholder={`Bayar sebagian atau lunasi · maks ${balance}`}/><Button title="Catat pembayaran" onPress={()=>{const amount=Number(payments[String(row.id)]);if(!amount||amount>balance)return Alert.alert('Periksa nominal','Pembayaran harus lebih dari nol dan tidak boleh melebihi saldo.');onPay(row,amount);setPayments(current=>({...current,[String(row.id)]:''}));}}/></View>})}<Text style={s.section}>DAFTAR PELANGGAN · {customers.length}</Text>{customers.map(c=><View key={c.id} style={s.row}><View style={s.flex}><Text style={s.rowTitle}>{c.name}</Text><Text style={s.small}>{c.phone||'Tanpa nomor telepon'}</Text></View></View>)}</ScrollView>;
}

function ExpensesPage({expenses,onSave}:{expenses:Expense[];onSave:(category:string,amount:number,note:string)=>void}) {
  const [category,setCategory]=useState('Operasional');const [amount,setAmount]=useState('');const [note,setNote]=useState('');
  return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>Pengeluaran</Text><View style={s.card}><Field value={category} onChangeText={setCategory} placeholder="Kategori"/><Field value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Nominal (Rp)"/><Field value={note} onChangeText={setNote} placeholder="Catatan (opsional)"/><Button title="Simpan pengeluaran" onPress={()=>{if(!Number(amount))return Alert.alert('Nominal diperlukan');onSave(category,Number(amount),note);setAmount('');setNote('');}}/></View><Text style={s.section}>RIWAYAT</Text>{expenses.map(e=><View key={e.id} style={s.row}><View style={s.flex}><Text style={s.rowTitle}>{e.category}</Text><Text style={s.small}>{e.note||new Date(e.spentAt).toLocaleDateString('id-ID')}</Text></View><Text style={s.price}>{idr(e.amount)}</Text></View>)}</ScrollView>;
}

function ReportsPage({report,expenses}:{report:{count:number;sales:number;expenses:number;best:Record<string,string|number|null>[];methods:Record<string,string|number|null>[]};expenses:Expense[]}) {
 return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>Laporan hari ini</Text><Text style={s.mutedText}>{new Date().toLocaleDateString('id-ID',{dateStyle:'full'})}</Text><View style={s.stats}><Stat label="Penjualan" value={idr(report.sales)}/><Stat label="Transaksi" value={String(report.count)}/></View><View style={s.stats}><Stat label="Pengeluaran" value={idr(report.expenses)}/><Stat label="Penjualan bersih" value={idr(report.sales-report.expenses)}/></View><Text style={s.section}>METODE PEMBAYARAN</Text>{report.methods.map((m,i)=><View key={i} style={s.row}><Text style={s.flex}>{String(m.paymentMethod)}</Text><Text style={s.price}>{idr(Number(m.total))}</Text></View>)}<Text style={s.section}>PRODUK TERLARIS</Text>{report.best.length===0&&<Text style={s.mutedText}>Belum ada penjualan.</Text>}{report.best.map((p,i)=><View key={i} style={s.row}><Text style={s.flex}>{i+1}. {String(p.productName)}</Text><Text style={s.small}>{String(p.quantity)} item · {idr(Number(p.total))}</Text></View>)}<Text style={s.small}>Ringkasan hanya menghitung transaksi hari ini. Laba kotor tidak disajikan karena harga modal dapat belum diisi.</Text><Text style={s.small}>Pengeluaran tercatat: {expenses.length} baris riwayat tersimpan.</Text></ScrollView>;
}

function DataPage({onExport,onReset}:{onExport:(kind:ExportKind,format:'csv'|'excel')=>void;onReset:()=>void}) {
 const datasets: [ExportKind,string][] = [['products','Produk'],['sales','Transaksi'],['expenses','Pengeluaran'],['customers','Pelanggan']];
 return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>Ekspor data</Text><Text style={s.mutedText}>Simpan salinan data usaha sebagai file Excel atau CSV melalui penyimpanan perangkat.</Text><View style={s.card}><Text style={s.section}>PILIH DATA</Text>{datasets.map(([kind,label])=><View key={kind} style={s.exportRow}><Text style={s.rowTitle}>{label}</Text><View style={s.exportActions}><Pressable accessibilityRole="button" onPress={()=>onExport(kind,'excel')} style={s.exportButton}><Text style={s.exportButtonText}>Excel</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>onExport(kind,'csv')} style={s.exportButton}><Text style={s.exportButtonText}>CSV</Text></Pressable></View></View>)}</View><View style={s.card}><Text style={s.section}>TENTANG DATA</Text><Text style={s.small}>Data tersimpan di perangkat ini dan tidak otomatis tersinkron ke perangkat lain. Simpan file ekspor di tempat yang aman.</Text></View><Button title="Reset data usaha" secondary onPress={onReset}/></ScrollView>;
}

function formatForMessage(format:'csv'|'excel') { return format==='csv'?'CSV':'Excel'; }

function Field(props:React.ComponentProps<typeof TextInput>) {return <TextInput {...props} placeholderTextColor="#9AA49C" style={[s.input,props.style]}/>;}
function Button({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean}) {return <Pressable onPress={onPress} style={[s.button,secondary&&s.secondary]}><Text style={[s.buttonText,secondary&&s.secondaryText]}>{title}</Text></Pressable>;}
function Pill({title,active,onPress}:{title:string;active:boolean;onPress:()=>void}) {return <Pressable onPress={onPress} style={[s.pill,active&&s.pillActive]}><Text style={[s.pillText,active&&s.pillTextActive]}>{title}</Text></Pressable>;}
function Stat({label,value}:{label:string;value:string}) {return <View style={s.stat}><Text style={s.small}>{label}</Text><Text style={s.statValue}>{value}</Text></View>;}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#F5F7F3'},center:{flex:1,justifyContent:'center',alignItems:'center',padding:24,gap:12},loadingIcon:{width:78,height:78,borderRadius:20},loadingTitle:{fontSize:16,fontWeight:'800',color:ink,textAlign:'center'},setup:{flex:1,justifyContent:'center',padding:26},setupLogo:{width:210,height:84,alignSelf:'flex-start',marginBottom:20},logo:{width:118,height:44},top:{height:62,paddingHorizontal:15,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#E5EAE5'},topRight:{flex:1,alignItems:'flex-end'},storeName:{fontSize:13,fontWeight:'800',color:ink},offline:{fontSize:8,color:green,fontWeight:'800',letterSpacing:.5,marginTop:3},body:{flex:1},tabs:{minHeight:62,backgroundColor:'#fff',borderTopColor:'#E5EAE5',borderTopWidth:1,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},tab:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:2,paddingVertical:6},tabIcon:{marginBottom:2},tabText:{fontSize:9,color:muted,fontWeight:'700'},tabActive:{color:green},content:{padding:16,paddingBottom:28},title:{fontSize:24,fontWeight:'800',color:ink,marginBottom:4},hero:{fontSize:34,fontWeight:'800',lineHeight:40,color:ink,marginVertical:12},eyebrow:{fontSize:10,color:green,fontWeight:'800',letterSpacing:1.2},mutedText:{fontSize:12,lineHeight:18,color:muted,marginBottom:12},label:{fontSize:10,color:muted,fontWeight:'800',marginTop:25},input:{height:48,borderWidth:1,borderColor:'#E3E8E2',borderRadius:12,paddingHorizontal:13,marginTop:10,marginBottom:9,backgroundColor:'#fff',fontSize:13,color:ink},button:{minHeight:46,backgroundColor:green,borderRadius:13,alignItems:'center',justifyContent:'center',paddingHorizontal:14,marginTop:10},buttonText:{color:'#fff',fontWeight:'800',fontSize:12},secondary:{backgroundColor:'#fff',borderWidth:1,borderColor:'#D9E3DC'},secondaryText:{color:green},small:{fontSize:10,color:muted,lineHeight:15,marginTop:3},section:{fontSize:9,color:muted,letterSpacing:1,fontWeight:'800',marginTop:18,marginBottom:7},row:{minHeight:61,backgroundColor:'#fff',borderBottomWidth:1,borderColor:'#EEF0EC',flexDirection:'row',alignItems:'center',paddingHorizontal:11},exportRow:{minHeight:52,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:'#EEF0EC'},exportActions:{flexDirection:'row',gap:8},exportButton:{minWidth:58,paddingHorizontal:10,paddingVertical:8,alignItems:'center',borderWidth:1,borderColor:'#D9E3DC',borderRadius:9},exportButtonText:{fontSize:10,fontWeight:'800',color:green},cartRow:{minHeight:53,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderColor:'#E8ECE7'},flex:{flex:1},right:{alignItems:'flex-end'},rowTitle:{fontSize:12,color:ink,fontWeight:'700'},price:{fontSize:12,color:green,fontWeight:'800'},add:{fontSize:9,color:green,fontWeight:'700',marginTop:4},qty:{width:95,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},qtyBtn:{fontSize:24,color:green,paddingHorizontal:7},total:{marginTop:12,paddingVertical:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderTopWidth:1,borderColor:'#DDE4DD'},totalValue:{fontSize:19,color:green,fontWeight:'800'},choices:{flexDirection:'row',flexWrap:'wrap',gap:7,marginVertical:7},pill:{borderRadius:20,borderWidth:1,borderColor:'#DDE4DD',paddingHorizontal:11,paddingVertical:8,backgroundColor:'#fff'},pillActive:{backgroundColor:'#EAF3ED',borderColor:green},pillText:{fontSize:10,color:ink},pillTextActive:{color:green,fontWeight:'800'},card:{backgroundColor:'#fff',borderRadius:15,borderWidth:1,borderColor:'#E5EAE5',padding:13,marginTop:10},stats:{flexDirection:'row',gap:9,marginTop:12},stat:{flex:1,minHeight:74,backgroundColor:'#fff',borderRadius:14,padding:12,borderWidth:1,borderColor:'#E5EAE5'},statValue:{fontSize:17,fontWeight:'800',color:green,marginTop:7},notice:{textAlign:'center',padding:7,backgroundColor:'#EAF3ED',fontSize:10,color:green},red:{color:'#AF433D'}});

export default App;
