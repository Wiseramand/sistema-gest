import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificateValidationPage(props: Props) {
  const params = await props.params;
  const certId = params?.id || '';
  redirect(`/verify/${encodeURIComponent(certId)}`);
}
