type SpaceBackdropProps = {
  active?: boolean;
  saving?: boolean;
};

export function SpaceBackdrop({ active = false, saving = false }: SpaceBackdropProps) {
  return (
    <div className={`space-backdrop ${active ? 'is-active' : ''} ${saving ? 'is-saving' : ''}`} aria-hidden="true">
      <div className="space-image" />
      <div className="space-glow" />
      <div className="space-ripples" />
      <div className="space-particles" />
      {saving && <div className="absorb-stream" />}
    </div>
  );
}
