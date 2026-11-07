import React, { useRef } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, RefreshCw, X } from 'lucide-react-native';
import { AppText, Button } from './ui';

export default function CameraCaptureModal({ visible, onClose, onCapture, showMessage }) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef(null);
  const [facing, setFacing] = React.useState('back');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (visible && !permission?.granted) requestPermission();
  }, [visible, permission?.granted, requestPermission]);

  const capture = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.86, base64: false });
      const name = `foto-tugas-${Date.now()}.jpg`;
      onCapture({ uri: photo.uri, name, sizeFormatted: 'Foto kamera', type: 'image' });
      onClose();
    } catch {
      showMessage('Tidak dapat mengambil foto. Periksa izin kamera lalu coba lagi.', 'Kamera');
    } finally {
      setBusy(false);
    }
  };

  return <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
    <View style={styles.root}>
      {permission?.granted ? <CameraView ref={camera} style={StyleSheet.absoluteFill} facing={facing} /> : <View style={styles.permission}><ActivityIndicator color="#fff" /><AppText style={styles.permissionText}>{permission ? 'Izin kamera diperlukan untuk memotret tugas.' : 'Memeriksa izin kamera...'}</AppText>{permission && !permission.granted ? <Button title="Izinkan Kamera" onPress={requestPermission} /> : null}</View>}
      <View style={styles.top}><Pressable onPress={onClose} style={styles.round}><X size={20} color="#fff" /></Pressable><AppText style={styles.title}>Foto Lembar Soal / Tugas</AppText><Pressable onPress={() => setFacing((value) => value === 'back' ? 'front' : 'back')} style={styles.round}><RefreshCw size={18} color="#fff" /></Pressable></View>
      {permission?.granted ? <View pointerEvents="none" style={styles.frame}><View style={styles.cornerRow}><View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} /></View><View style={styles.cornerRow}><View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} /></View></View> : null}
      <View style={styles.bottom}>{permission?.granted ? <Pressable onPress={capture} style={styles.shutter} disabled={busy}>{busy ? <ActivityIndicator color="#111827" /> : <View style={styles.shutterInner}><Camera size={22} color="#111827" /></View>}</Pressable> : null}</View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617', justifyContent: 'space-between' }, permission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 28 }, permissionText: { color: '#fff', fontSize: 12, textAlign: 'center' }, top: { paddingTop: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.35)' }, round: { width: 40, height: 40, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }, title: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, frame: { position: 'absolute', top: '22%', bottom: '20%', left: 30, right: 30, justifyContent: 'space-between' }, cornerRow: { flexDirection: 'row', justifyContent: 'space-between' }, corner: { width: 20, height: 20, borderColor: '#0062FF' }, topLeft: { borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 8 }, topRight: { borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 8 }, bottomLeft: { borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 8 }, bottomRight: { borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 8 }, bottom: { height: 130, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }, shutter: { width: 76, height: 76, borderRadius: 40, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 5 }, shutterInner: { flex: 1, alignSelf: 'stretch', borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
