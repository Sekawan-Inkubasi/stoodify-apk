import React from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react-native';
import ModalSheet from './ModalSheet';
import { AppText, Button, Card, EmptyState } from './ui';
import { colors } from '../constants/theme';

export default function NotificationsModal({ visible, onClose, notifications, onMarkAll, onMarkRead }) {
  return <ModalSheet visible={visible} title="Notifikasi" subtitle="Pengingat dan informasi belajarmu" onClose={onClose}>
    {notifications.some((item) => !item.isRead) ? <Button title="Tandai Semua Dibaca" icon={CheckCheck} variant="secondary" compact onPress={onMarkAll} /> : null}
    {notifications.length ? notifications.map((item) => <Card key={item.id} onPress={() => onMarkRead(item)} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 13, backgroundColor: item.isRead ? '#fff' : '#F4F8FF' }}><Bell size={17} color={item.isRead ? '#94A3B8' : colors.primary} /><View style={{ flex: 1, gap: 4 }}><AppText style={{ fontFamily: 'Poppins_700Bold', fontSize: 10 }}>{item.title}</AppText><AppText style={{ color: colors.muted, fontSize: 9, lineHeight: 15 }}>{item.message}</AppText><AppText style={{ color: '#94A3B8', fontSize: 8 }}>{item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : 'Baru saja'}</AppText></View>{!item.isRead ? <Circle size={8} color={colors.primary} fill={colors.primary} /> : null}</Card>) : <EmptyState icon={Bell} title="Belum Ada Notifikasi" subtitle="Pengingat tugas dan aktivitas belajar akan muncul di sini." />}
  </ModalSheet>;
}
