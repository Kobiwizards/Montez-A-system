import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartment: string;
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM';
  rentAmount: number;
  balance: number;
  status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT';
  moveInDate: string;
}

interface TenantTableProps {
  tenants: Tenant[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function TenantTable({ tenants, onDelete, loading = false }: TenantTableProps) {
  const getStatusBadge = (status: Tenant['status']) => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="success">Current</Badge>;
      case 'OVERDUE':
        return <Badge variant="warning">Overdue</Badge>;
      case 'DELINQUENT':
        return <Badge variant="error">Delinquent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUnitTypeLabel = (type: Tenant['unitType']) => {
    return type === 'ONE_BEDROOM' ? 'One Bedroom' : 'Two Bedroom';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tenants...</p>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-secondary-800 mx-auto mb-4 flex items-center justify-center">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
        <p className="text-muted-foreground">No tenants have been added yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Apartment</TableHead>
            <TableHead>Unit Type</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Move-in Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id} className="hover:bg-secondary-800/50">
              <TableCell>
                <div>
                  <p className="font-medium">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">{tenant.email}</p>
                  <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{tenant.apartment}</Badge>
              </TableCell>
              <TableCell>{getUnitTypeLabel(tenant.unitType)}</TableCell>
              <TableCell className="font-medium">
                KSh {tenant.rentAmount.toLocaleString()}
              </TableCell>
              <TableCell>
                <span className={tenant.balance > 0 ? 'text-error' : 'text-success'}>
                  KSh {tenant.balance.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(tenant.status)}</TableCell>
              <TableCell>
                {new Date(tenant.moveInDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/tenants/${tenant.id}`}>
                    <Button variant="ghost" size="icon" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/tenants/${tenant.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete && onDelete(tenant.id)}
                    className="text-error hover:text-error"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
