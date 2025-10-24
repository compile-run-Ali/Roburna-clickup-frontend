"use client";

import { ExtendedUser } from "@/app/api/auth/[...nextauth]/options";
import { useState, useEffect } from "react";
import { Search, Eye, Plus, ChevronDown, Edit, X, Loader } from "lucide-react";
import { useSession } from "next-auth/react";

interface ClientManagementClientProps {
  user: ExtendedUser;
}

interface Client {
  client_id: string;
  name: string;
  company: string;
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  organization_id: string;
}

interface ClientFormData {
  name: string;
  company: string;
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}



export default function ClientManagementClient({ user }: ClientManagementClientProps) {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    company: "",
    health: "good"
  });

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.accessToken) {
        setError('No access token available');
        return;
      }

      const params = new URLSearchParams();
      if (nameFilter) params.append('name', nameFilter);
      if (companyFilter) params.append('company', companyFilter);
      if (healthFilter) params.append('health', healthFilter);

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/view_clients${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }

      const clientsData = await response.json();
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Add new client
  const addClient = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!session?.accessToken) {
        setError('No access token available');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/client/add_client`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add client');
      }

      const result = await response.json();
      setSuccess('Client added successfully!');
      setShowAddModal(false);
      setFormData({ name: "", company: "", health: "good" });
      await fetchClients(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update client
  const updateClient = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!session?.accessToken || !editingClient) {
        setError('No access token or client selected');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/client/update_client_info/${editingClient.client_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update client');
      }

      const result = await response.json();
      setSuccess('Client updated successfully!');
      setShowEditModal(false);
      setEditingClient(null);
      setFormData({ name: "", company: "", health: "good" });
      await fetchClients(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit client
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      company: client.company,
      health: client.health
    });
    setShowEditModal(true);
  };

  // Handle add client
  const handleAddClient = () => {
    setFormData({ name: "", company: "", health: "good" });
    setShowAddModal(true);
  };

  // Load clients on component mount and when filters change
  useEffect(() => {
    if (session?.accessToken) {
      fetchClients();
    }
  }, [session?.accessToken, nameFilter, companyFilter, healthFilter]);

  const filteredClients = clients;

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthTextColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'excellent':
        return 'text-green-300';
      case 'good':
        return 'text-blue-300';
      case 'fair':
        return 'text-yellow-300';
      case 'poor':
        return 'text-orange-300';
      case 'critical':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Calculate totals
  const totalClients = clients.length;
  const healthStats = clients.reduce((acc, client) => {
    acc[client.health] = (acc[client.health] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen roburna-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="animate-spin" size={32} />
          <span className="roburna-text-primary text-lg">Loading clients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen roburna-bg-primary p-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 roburna-success-message rounded-lg p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <p className="font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 roburna-error-message rounded-lg p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold roburna-gradient-text">Client Management</h1>
            <p className="roburna-text-secondary text-sm">Manage client relationships and project oversight</p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-4">
            <div className="roburna-success-message rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{totalClients} Total</span>
            </div>
            <div className="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 font-medium">{healthStats.good || 0} Good</span>
            </div>
            <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-300 font-medium">{healthStats.critical || 0} Critical</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 roburna-text-muted" size={18} />
            <input
              type="text"
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 roburna-input"
            />
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by company..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="roburna-input px-4 py-2.5"
            />
          </div>
          
          <div className="relative">
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="appearance-none roburna-select px-4 py-2.5 pr-8"
            >
              <option value="">All Health</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="critical">Critical</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          <button
            onClick={handleAddClient}
            className="roburna-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Client
          </button>
        </div>
      </div>

      {/* Client Table */}
      <div className="roburna-table rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 roburna-table-header text-sm font-medium">
          <div className="col-span-4">Client</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Health</div>
          <div className="col-span-3">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y roburna-border">
          {filteredClients.map((client) => (
            <div key={client.client_id} className="grid grid-cols-12 gap-4 px-6 py-4 roburna-table-row transition-colors">
              {/* Client Info */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium roburna-text-primary">{client.name}</div>
                  <div className="text-sm roburna-text-secondary">ID: {client.client_id}</div>
                </div>
              </div>

              {/* Company */}
              <div className="col-span-3 flex flex-col justify-center">
                <div className="font-medium roburna-text-primary">{client.company}</div>
                <div className="text-sm roburna-text-secondary">Organization</div>
              </div>

              {/* Health */}
              <div className="col-span-2 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getHealthColor(client.health)}`}></div>
                <span className={`font-medium ${getHealthTextColor(client.health)}`}>
                  {capitalizeFirst(client.health)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-3 flex items-center gap-2">
                <button 
                  onClick={() => handleEditClient(client)}
                  className="roburna-btn-secondary text-sm flex items-center gap-1"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button className="roburna-btn-primary text-sm flex items-center gap-1">
                  <Eye size={14} />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="roburna-text-muted mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium roburna-text-primary mb-2">No clients found</h3>
            <p className="roburna-text-secondary">
              {nameFilter || companyFilter || healthFilter 
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first client."
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold roburna-text-primary">Add New Client</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="roburna-text-muted hover:roburna-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium roburna-text-secondary mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  className="w-full roburna-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium roburna-text-secondary mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full roburna-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium roburna-text-secondary mb-2">
                  Health Status
                </label>
                <select
                  name="health"
                  value={formData.health}
                  onChange={handleInputChange}
                  className="w-full roburna-select"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addClient}
                disabled={isSubmitting || !formData.name || !formData.company}
                className="flex-1 roburna-btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader size={18} className="animate-spin" />}
                {isSubmitting ? 'Adding...' : 'Add Client'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="roburna-modal max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold roburna-text-primary">Edit Client</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="roburna-text-muted hover:roburna-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium roburna-text-secondary mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  className="w-full roburna-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium roburna-text-secondary mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full roburna-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium roburna-text-secondary mb-2">
                  Health Status
                </label>
                <select
                  name="health"
                  value={formData.health}
                  onChange={handleInputChange}
                  className="w-full roburna-select"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={updateClient}
                disabled={isSubmitting || !formData.name || !formData.company}
                className="flex-1 roburna-btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader size={18} className="animate-spin" />}
                {isSubmitting ? 'Updating...' : 'Update Client'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 roburna-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}