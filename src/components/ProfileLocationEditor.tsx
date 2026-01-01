import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { MapPin, Edit2, Save, X } from "lucide-react";
import { useUpdateLocation } from "../helpers/useProfile";
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from "./Form";
import { z } from "zod";
import styles from "./ProfileLocationEditor.module.css";

const locationSchema = z.object({
  province: z.string().nullable(),
  district: z.string().nullable(),
});

interface ProfileLocationEditorProps {
  province: string | null;
  district: string | null;
}

export const ProfileLocationEditor = ({
  province,
  district,
}: ProfileLocationEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateLocation, isPending } = useUpdateLocation();

  const form = useForm({
    defaultValues: {
      province: province || "",
      district: district || "",
    },
    schema: locationSchema,
  });

  // Update form values when props change
  useEffect(() => {
    if (!isEditing) {
      form.setValues({
        province: province || "",
        district: district || "",
      });
    }
  }, [province, district, isEditing, form.setValues]);

  const handleSubmit = (values: z.infer<typeof locationSchema>) => {
    updateLocation(
      {
        province: values.province || null,
        district: values.district || null,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setValues({
      province: province || "",
      district: district || "",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <MapPin size={20} className={styles.icon} />
          Địa điểm của tôi
        </h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className={styles.editButton}
          >
            <Edit2 size={14} />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {isEditing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className={styles.form}
          >
            <div className={styles.inputs}>
              <FormItem name="province" className={styles.formItem}>
                <FormLabel>Tỉnh / Thành phố</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập tỉnh/thành phố"
                    value={form.values.province || ""}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        province: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="district" className={styles.formItem}>
                <FormLabel>Quận / Huyện</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập quận/huyện"
                    value={form.values.district || ""}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X size={16} /> Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                <Save size={16} /> Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className={styles.display}>
          {province || district ? (
            <p className={styles.locationText}>
              {district ? `${district}, ` : ""}
              {province}
            </p>
          ) : (
            <p className={styles.emptyText}>Chưa cập nhật địa điểm</p>
          )}
        </div>
      )}
    </div>
  );
};