import { useState, FormEvent, ChangeEvent } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { api, Token } from './services/api';
import { ChartBarIcon, CurrencyDollarIcon, CodeIcon, DocumentTextIcon, CheckCircleIcon, CheckIcon, ExclamationIcon, ClipboardCopyIcon, ShieldCheckIcon, ExclamationCircleIcon, SearchIcon, UserGroupIcon } from '@heroicons/react/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const queryClient = new QueryClient();

function TokenList() {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyClick = async (text: string | undefined) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const { data: tokens, isLoading, error: tokensError } = useQuery(
    ['mostScannedTokens', page],
    () => api.getMostScannedTokens(page),
    { 
      enabled: !isSearching,
      retry: 2,
      keepPreviousData: true
    }
  );

  const { data: tokenDetails, isLoading: _isLoadingDetails, error: _detailsError } = useQuery(
    ['tokenDetails', selectedToken],
    () => selectedToken ? api.getTokenDetails(selectedToken) : null,
    { 
      enabled: !!selectedToken,
      retry: 2,
      onError: (error) => {
        console.error('Error fetching token details:', error);
      }
    }
  );

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setSelectedToken(searchQuery.trim());
    }
  };

  const handleTokenClick = (address: string) => {
    setSearchQuery(address);
    setSelectedToken(address);
    setIsSearching(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toString();
  };

  const formatAddress = (address: string | undefined): string => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-gray-900 to-black text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-solana rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
        <div className="text-center mb-12 relative">
          <div className="inline-block">
            <h1 className="text-6xl font-bold mb-4 relative z-10">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-solana via-purple-500 to-pink-500 animate-gradient-x">
                Solana Memecoin Scanner
              </span>
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-solana via-purple-500 to-pink-500 rounded-full transform scale-x-0 animate-scale-in"></div>
          </div>
          <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">Track and analyze the hottest Solana memecoins in real-time</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Enter token address to scan..."
                className="w-full px-6 py-4 bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 focus:ring-2 focus:ring-solana focus:border-transparent focus:outline-none text-lg transition-all duration-300 hover:bg-gray-800/40"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-solana to-purple-500 rounded-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
              >
                <SearchIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </form>

          {isSearching && (
            <button
              onClick={() => {
                setIsSearching(false);
                setSelectedToken(null);
                setSearchQuery('');
              }}
              className="mb-8 px-6 py-3 bg-gray-800/30 backdrop-blur-xl rounded-xl border border-gray-700/50 hover:bg-gray-700/40 transition-all duration-300 hover:scale-105 group"
            >
              <span className="inline-flex items-center">
                <svg className="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Most Scanned Tokens
              </span>
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Token List Section */}
          {!isSearching ? (
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-8 border border-gray-700/50 shadow-2xl transition-all duration-300 hover:shadow-solana/20">
              <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-solana to-purple-500">
                Most Scanned Tokens
              </h2>
              {tokensError ? (
                <div className="text-red-400 p-4 bg-red-900/20 rounded-xl border border-red-700">
                  Failed to load tokens. Please try again later.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tokens && tokens.length > 0 ? (
                    <>
                      {tokens.map((token: Token) => (
                        <div
                          key={token.address}
                          onClick={() => handleTokenClick(token.address)}
                          className={`p-6 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                            selectedToken === token.address
                              ? 'bg-gradient-to-r from-solana/20 to-purple-500/20 border border-solana shadow-lg shadow-solana/20'
                              : 'bg-gray-800/30 hover:bg-gray-700/30 border border-gray-700/50'
                          }`}
                        >
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{token.name}</h3>
                              <p className="text-gray-400 text-sm">{token.symbol}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-400">Price</p>
                                <p className="text-lg font-bold">${token.price.toFixed(6)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">24h Change</p>
                                <p className={`text-sm font-medium flex items-center ${
                                  token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {token.priceChange24h >= 0 ? (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                  )}
                                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Market Cap</p>
                                <p className="text-sm font-medium">${formatNumber(token.marketCap)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Holders</p>
                                <p className="text-sm font-medium">{formatNumber(token.holders)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="col-span-full flex justify-between mt-6">
                        <button
                          onClick={() => setPage(p => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="px-6 py-3 bg-gray-800/30 rounded-xl disabled:opacity-50 transition-all duration-300 hover:bg-gray-700/30 disabled:hover:bg-gray-800/30 border border-gray-700/50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(p => p + 1)}
                          disabled={!tokens || tokens.length < 10}
                          className="px-6 py-3 bg-gray-800/30 rounded-xl disabled:opacity-50 transition-all duration-300 hover:bg-gray-700/30 disabled:hover:bg-gray-800/30 border border-gray-700/50"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full text-gray-400 p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                      No tokens found.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Token Details View */
            <div className="space-y-8">
              {/* Header Section with Glassmorphism */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/30 shadow-2xl">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-solana/20 to-purple-500/20"></div>
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-solana/30 rounded-full filter blur-3xl"></div>
                  <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/30 rounded-full filter blur-3xl"></div>
                </div>
                
                <div className="relative p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    {tokenDetails?.tokenImg && (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-solana via-purple-600 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <img 
                          src={tokenDetails.tokenImg} 
                          alt={tokenDetails.name} 
                          className="relative w-32 h-32 rounded-full ring-4 ring-purple-500/20 transform transition-all duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-solana via-purple-500 to-pink-500 animate-gradient-x">
                          {tokenDetails?.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-2xl text-solana font-medium">{tokenDetails?.symbol}</span>
                          {tokenDetails?.score && (
                            <div className={`px-6 py-2 rounded-full font-bold backdrop-blur-md ${
                              tokenDetails.score >= 70 ? 'bg-green-500/10 text-green-400 border border-green-500/50' :
                              tokenDetails.score >= 40 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/50' : 
                              'bg-red-500/10 text-red-400 border border-red-500/50'
                            } transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                              <span className="mr-2">●</span>
                              Safety Score: {tokenDetails.score}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {tokenDetails?.website && (
                          <a
                            href={tokenDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-solana/10 to-purple-500/10 rounded-full border border-solana/30 hover:border-solana transition-all duration-300 text-solana group"
                          >
                            <svg className="w-5 h-5 mr-2 transform transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                            </svg>
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Animated Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-8">
                    <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/30 hover:border-solana/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                      <ChartBarIcon className="h-8 w-8 text-solana mb-3 transform transition-transform group-hover:scale-110 group-hover:rotate-6" />
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Market Cap</p>
                      <p className="text-2xl font-bold group-hover:text-solana transition-colors">${formatNumber(tokenDetails?.marketCap || 0)}</p>
                    </div>
                    <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/30 hover:border-solana/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                      <CurrencyDollarIcon className="h-8 w-8 text-solana mb-3 transform transition-transform group-hover:scale-110 group-hover:rotate-6" />
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Supply</p>
                      <p className="text-2xl font-bold group-hover:text-solana transition-colors">{formatNumber(tokenDetails?.supply || 0)}</p>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Contract and Security Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contract Details Card */}
                <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/30 p-8 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-solana/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h4 className="text-xl font-bold mb-6 flex items-center">
                    <CodeIcon className="h-6 w-6 mr-3 text-solana" />
                    Contract Details
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: "Token Type", value: tokenDetails?.type || "SPL-TOKEN", copyable: false },
                      { label: "Contract Address", value: tokenDetails?.address, copyable: true },
                      { label: "Contract Creator", value: tokenDetails?.deployer, copyable: true },
                      { label: "Contract Mint", value: tokenDetails?.mint, copyable: true }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30 backdrop-blur-md transition-all duration-300 hover:border-solana/30">
                        <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium font-mono text-gray-200">
                            {item.copyable ? formatAddress(item.value) : item.value}
                          </p>
                          {item.copyable && item.value && (
                            <button
                              onClick={() => handleCopyClick(item.value)}
                              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 group/copy"
                            >
                              <ClipboardCopyIcon className="w-5 h-5 text-gray-400 group-hover/copy:text-solana transition-colors" />
                              {copiedText === item.value && (
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg">
                                  Copied!
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Status Card */}
                {tokenDetails?.auditRisk && (
                  <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/30 p-8 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-solana/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h4 className="text-xl font-bold mb-6 flex items-center">
                      <ShieldCheckIcon className="h-6 w-6 mr-3 text-solana" />
                      Security Status
                    </h4>
                    <div className="grid gap-4">
                      {[
                        {
                          label: "Mint Status",
                          status: tokenDetails.auditRisk.mintDisabled,
                          positive: "Disabled",
                          negative: "Enabled"
                        },
                        {
                          label: "Freeze Authority",
                          status: tokenDetails.auditRisk.freezeDisabled,
                          positive: "Disabled",
                          negative: "Enabled"
                        },
                        {
                          label: "LP Tokens",
                          status: tokenDetails.auditRisk.lpBurned,
                          positive: "Burned",
                          negative: "Not Burned"
                        }
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`group/item p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                            item.status
                              ? 'bg-green-500/10 border-green-500/30 hover:border-green-500'
                              : 'bg-red-500/10 border-red-500/30 hover:border-red-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">{item.label}</span>
                            <div className={`flex items-center ${
                              item.status ? 'text-green-400' : 'text-red-400'
                            }`}>
                              <span className="mr-2">{item.status ? item.positive : item.negative}</span>
                              <span className="transform transition-transform group-hover/item:rotate-12">
                                {item.status ? '✓' : '⚠'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description Section */}
              {tokenDetails?.description && (
                <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/30 p-8 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-solana/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-3 text-solana" />
                    About
                  </h4>
                  <p className="text-gray-300 leading-relaxed">{tokenDetails.description}</p>
                </div>
              )}

              {/* Risk Analysis Section */}
              {tokenDetails?.indicatorData && (
                <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/30 p-8 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-solana/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h4 className="text-xl font-bold mb-6 flex items-center">
                    <ExclamationCircleIcon className="h-6 w-6 mr-3 text-solana" />
                    Risk Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-500/10 rounded-2xl border border-green-500/30 transition-all duration-300 hover:border-green-500">
                      <h5 className="font-semibold text-green-400 mb-4 flex items-center text-lg">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Security Features
                      </h5>
                      <div className="space-y-3">
                        {Object.entries({
                          ...(tokenDetails.indicatorData.moderate?.details || {}),
                          ...(tokenDetails.indicatorData.low?.details || {}),
                          ...(tokenDetails.indicatorData.specific?.details || {})
                        }).map(([key, value]) => (
                          value === true && (
                            <p key={key} className="text-green-400 flex items-center group/item">
                              <CheckIcon className="w-4 h-4 mr-3 flex-shrink-0 transform transition-transform group-hover/item:scale-110 group-hover/item:rotate-12" />
                              <span className="group-hover/item:text-green-300 transition-colors">{key}</span>
                            </p>
                          )
                        ))}
                      </div>
                    </div>

                    {tokenDetails.indicatorData.high?.count > 0 && (
                      <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/30 transition-all duration-300 hover:border-red-500">
                        <h5 className="font-semibold text-red-400 mb-4 flex items-center text-lg">
                          <ExclamationIcon className="w-5 h-5 mr-2" />
                          High Risk Factors
                        </h5>
                        <div className="space-y-3">
                          {Object.entries(tokenDetails.indicatorData.high.details).map(([key, value]) => (
                            value === true && (
                              <p key={key} className="text-red-400 flex items-center group/item">
                                <ExclamationCircleIcon className="w-4 h-4 mr-3 flex-shrink-0 transform transition-transform group-hover/item:scale-110 group-hover/item:rotate-12" />
                                <span className="group-hover/item:text-red-300 transition-colors">{key}</span>
                              </p>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Holders Section */}
              {tokenDetails?.ownersList && tokenDetails.ownersList.length > 0 && (
                <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-3xl border border-gray-700/30 p-8 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-solana/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h4 className="text-xl font-bold mb-6 flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-3 text-solana" />
                    Top Holders
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tokenDetails.ownersList.slice(0, 5).map((holder, index) => (
                      <div key={index} className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/30 transition-all duration-300 hover:border-solana/30 group/item">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-600/50 flex items-center justify-center text-solana font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-300 group-hover/item:text-solana transition-colors">{formatAddress(holder.address)}</p>
                            <p className="text-sm text-gray-400">
                              {holder?.percentage && !isNaN(Number(holder.percentage))
                                ? `${Number(holder.percentage).toFixed(2)}% of supply`
                                : 'Unknown percentage'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TokenList />
    </QueryClientProvider>
  );
}
