import React, { useState } from 'react';
import { Raffle } from '../types';
import { API_URL } from '../services/api';

interface CreateRaffleProps {
    onRaffleCreated?: () => void;
}

const CreateRaffle: React.FC<CreateRaffleProps> = ({ onRaffleCreated }) => {
    const [title, setTitle] = useState('');
    const [pricePerQuota, setPricePerQuota] = useState('');
    const [totalQuotas, setTotalQuotas] = useState('');
    const [quickSelectPackages, setQuickSelectPackages] = useState('10, 50, 100, 500');
    const [imageType, setImageType] = useState<'url' | 'upload'>('url');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Preview da imagem URL
    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            setImagePreview(url);
        } else {
            setImagePreview('');
        }
    };

    // Preview da imagem upload
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Selecionar tipo de imagem
    const handleImageTypeSelect = (type: 'url' | 'upload') => {
        setImageType(type);
        setImagePreview('');
        setImageUrl('');
        setImageFile(null);
        
        // Limpar campos
        if (type === 'upload') {
            document.getElementById('image-upload-input')?.setAttribute('value', '');
        } else {
            document.getElementById('image-url-input')?.setAttribute('value', '');
        }
    };

    // Enviar formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('pricePerQuota', parseFloat(pricePerQuota));
            formData.append('totalQuotas', parseInt(totalQuotas));
            formData.append('quickSelectPackages', quickSelectPackages);

            // Adicionar imagem baseada no tipo
            if (imageType === 'url') {
                if (imageUrl) {
                    formData.append('imageUrl', imageUrl);
                }
            } else if (imageType === 'upload' && imageFile) {
                formData.append('image', imageFile);
            }

            const response = await fetch(`${API_URL}/admin/create-raffle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Rifa criada com sucesso!');
                setTitle('');
                setPricePerQuota('');
                setTotalQuotas('');
                setQuickSelectPackages('10, 50, 100, 500');
                setImageUrl('');
                setImageFile(null);
                setImagePreview('');
                setImageType('url');
                
                if (onRaffleCreated) {
                    onRaffleCreated();
                }
            } else {
                setError(data.message || 'Erro ao criar rifa');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    🎲 Criar Nova Rifa
                </h2>
                <p className="text-gray-600 mb-6">
                    Crie uma nova rifa com imagem externa ou upload de arquivo
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">❌ {error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600">✅ {success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título da Rifa
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Rifa de Premiação Especial"
                        required
                    />
                </div>

                {/* Preço por Cota */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço por Cota (R$)
                    </label>
                    <input
                        type="number"
                        value={pricePerQuota}
                        onChange={(e) => setPricePerQuota(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10.00"
                        step="0.01"
                        min="0.01"
                        required
                    />
                </div>

                {/* Total de Cotas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total de Cotas
                    </label>
                    <input
                        type="number"
                        value={totalQuotas}
                        onChange={(e) => setTotalQuotas(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                        min="1"
                        max="100000"
                        required
                    />
                </div>

                {/* Pacotes de Seleção Rápida */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pacotes de Seleção Rápida (separados por vírgula)
                    </label>
                    <input
                        type="text"
                        value={quickSelectPackages}
                        onChange={(e) => setQuickSelectPackages(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10, 50, 100, 500"
                    />
                    <p className="text-sm text-gray-500">
                        Ex: 10, 50, 100, 500 (máximo até o total de cotas)
                    </p>
                </div>

                {/* Tipo de Imagem */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        🖼️ Tipo de Imagem da Rifa
                    </label>
                    <div className="flex space-x-4 mb-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="imageType"
                                value="url"
                                checked={imageType === 'url'}
                                onChange={() => handleImageTypeSelect('url')}
                                className="mr-2"
                            />
                            <span className="ml-2">URL da Imagem (Link)</span>
                            <small className="block text-gray-500">Cole o link da imagem</small>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="imageType"
                                value="upload"
                                checked={imageType === 'upload'}
                                onChange={() => handleImageTypeSelect('upload')}
                                className="mr-2"
                            />
                            <span className="ml-2">Upload de Arquivo</span>
                            <small className="block text-gray-500">Envie imagem PNG ou JPEG</small>
                        </label>
                    </div>
                </div>

                {/* Campo URL da Imagem */}
                {imageType === 'url' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔗 URL da Imagem da Rifa
                        </label>
                        <input
                            id="image-url-input"
                            type="url"
                            value={imageUrl}
                            onChange={handleImageUrlChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8?w=800"
                        />
                    </div>
                )}

                {/* Campo Upload de Arquivo */}
                {imageType === 'upload' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📤 Upload de Arquivo
                        </label>
                        <input
                            id="image-upload-input"
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleImageFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* Preview da Imagem */}
                {imagePreview && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            👁 Preview da Imagem
                        </label>
                        <div className="flex justify-center">
                            <img 
                                src={imagePreview} 
                                alt="Preview da imagem" 
                                className="max-w-xs max-h-32 rounded-lg border border-gray-300"
                            />
                        </div>
                    </div>
                )}

                {/* Botão de Enviar */}
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Criando...' : '🎲 Criar Rifa'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRaffle;
