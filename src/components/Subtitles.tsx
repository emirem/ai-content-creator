type Props = {
  message: string | undefined;
};

export function Subtitles({ message }: Props) {
  return (
    <div className="p-2">
      <p className="mt-2 text-center text-xl text-white">
        {message || (
          <small className="text-gray-500">[ Ted&apos;s response here ]</small>
        )}
      </p>
    </div>
  );
}
